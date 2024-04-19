import db, { storage } from '../firebase'
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import puppeteer from 'puppeteer'
import admin from 'firebase-admin'
import { defaultPageSnapshot } from '../constants'
import {
    CommitPageSnapshotType,
    CommitType,
    CommitValuesType,
    SCREENSHOT_STATUS_TYPE,
} from '../types'
import { Server } from 'socket.io'
import {
    finishTask,
    isTaskRunning,
} from '../controllers/taskManager/taskManager'
import { keyBy } from '../helpers/keyBy'
import { compareImage } from './compareImage'
import { create } from 'domain'

export const handleCreateNewVisualCheck = async (
    projectId: string,
    userId: string
) => {
    try {
        const newVisualCheck = {
            fail: 0,
            progress: 0,
            projectId,
            status: 0, // 0: running, 1: done, 2: cancel
            success: 0,
            createdAt: new Date().toString(),
            finishAt: null,
            userId,
        }

        const visualChecksRef = collection(db, `/visualchecks`)
        const id = (await addDoc(visualChecksRef, newVisualCheck)).id

        return id
    } catch (error) {
        throw error
    }
}

export const handleAddPageSnapshotDocs = async (
    visualCheckId: string,
    projectId: string
) => {
    try {
        await handleCreteSubCollection(visualCheckId)

        const commitPagesSnapshotsRef = collection(
            db,
            `/visualchecks/${visualCheckId}/pagesnapshots`
        )

        const basePagesSnapshotsRef = collection(
            db,
            `/projects/${projectId}/pageSnapShot`
        )

        const basePageSnapsSnap = await getDocs(basePagesSnapshotsRef)

        const basePageSnapshots: { id: string; url: string; path: string }[] =
            []

        basePageSnapsSnap.docs.forEach((doc) => {
            const data = doc.data()

            if (data.screenshotStatus === SCREENSHOT_STATUS_TYPE.done) {
                basePageSnapshots.push({
                    id: doc.id,
                    url: data.url,
                    path: data.path,
                })
            }
        })

        const basePageSnapsUrlsObject = keyBy(basePageSnapshots, 'url')

        for (const basePageSnapshot of basePageSnapshots) {
            const pageSnapshot = {
                ...defaultPageSnapshot,
                createdAt: new Date().toString(),
                currentBasePath:
                    basePageSnapsUrlsObject[basePageSnapshot.url].path,
                url: basePageSnapshot.url,
            }

            await addDoc(commitPagesSnapshotsRef, pageSnapshot)
        }

        return visualCheckId
    } catch (error) {
        throw error
    }
}

const handleGetNewCommit = async (
    projectId: string,
    visualCheckId: string,
    socket: Server
) => {
    const commitPagesSnapshotsRef = collection(
        db,
        `/visualchecks/${visualCheckId}/pagesnapshots`
    )

    const commitRef = doc(db, `/visualchecks/${visualCheckId}`)

    const [commitPagesSnapshotsSnap, commitSnap] = await Promise.all([
        getDocs(commitPagesSnapshotsRef),
        getDoc(commitRef),
    ])

    const commitPagesSnapshots = commitPagesSnapshotsSnap.docs.map((doc) => {
        const data = doc.data()

        return {
            id: doc.id,
            url: data.url,
            path: data.path,
            diff: data.diff,
            match: data.match,
            createdAt: data.createdAt,
            diffImage: data.diffImage,
            diffPixel: data.diffPixel,
            status: data.status,
            finishAt: data.finishAt,
            currentBasePath: data.currentBasePath,
        }
    })

    const commit = commitSnap.data()

    const responseCommit: CommitType = {
        id: commitSnap.id,
        fail: commit?.fail ?? 0,
        success: commit?.success ?? 0,
        progress: commit?.progress ?? 0,
        projectId: commit?.projectId ?? '',
        screenshotingUrl: commit?.screenshotingUrl ?? '',
        userId: commit?.userId ?? '',
        pageSnapshots: commitPagesSnapshots,
        createdAt: commit?.createdAt ?? '',
        finishAt: commit?.finishAt ?? '',
        status: commit?.status ?? 0,
    }

    handleEmitNewCommit(socket, projectId, visualCheckId, responseCommit)

    return responseCommit
}

const handleEmitNewCommit = (
    socket: Server,
    projectId: string,
    visualCheckId: string,
    newCommit: CommitType
) => {
    socket.emit(`projectId-${projectId}-new-created-commit`, {
        newCommit,
        visualCheckId,
    })
}

export const handleUpdatePageSnapshotDocs = async (
    visualCheckId: string,
    projectId: string,
    socket: Server
) => {
    try {
        const commit = await handleGetNewCommit(
            projectId,
            visualCheckId,
            socket
        )

        const commitValues: CommitValuesType = {
            success: 0,
            fail: 0,
            completed: 0,
            commitsTotal: commit.pageSnapshots.length,
        }

        for (const commitPagesSnapshot of commit.pageSnapshots) {
            if (!isTaskRunning(visualCheckId)) {
                break
            }

            try {
                handleEmitImageProcessStartEvent(
                    commitPagesSnapshot.url,
                    visualCheckId,
                    projectId,
                    socket
                )

                handleUpdateUrl(
                    visualCheckId,
                    undefined,
                    undefined,
                    commitPagesSnapshot.url
                )

                const screenshotData = await handleScreenshot(
                    commitPagesSnapshot.url,
                    projectId
                )

                const compareImageData = await compareImage(
                    commitPagesSnapshot.currentBasePath,
                    screenshotData.path
                )

                const pagesSnapshotsRef = doc(
                    db,
                    `/visualchecks/${visualCheckId}/pagesnapshots/${commitPagesSnapshot.id}`
                )

                await updateDoc(pagesSnapshotsRef, {
                    ...screenshotData,
                    ...compareImageData,
                })

                commitValues.success++
            } catch (error) {
                commitValues.fail++
            } finally {
                commitValues.completed++
                handleEmitImageProcessEndEvent(
                    commitValues,
                    visualCheckId,
                    commitPagesSnapshot.id,
                    projectId,
                    socket
                )
            }
        }
        finishTask(visualCheckId)
        handleUpdateUrl(visualCheckId, projectId, socket)
        handleUpdateCommitValues(visualCheckId, commitValues)
    } catch (error) {
        // throw error
    }
}

const handleUpdateCommitValues = async (
    visualCheckId: string,
    updateCommitValues: CommitValuesType
) => {
    const currentCommitRef = doc(db, `/visualchecks/${visualCheckId}`)

    const { fail, success, completed, commitsTotal } = updateCommitValues

    const progress = Math.round((completed / commitsTotal) * 100)

    await updateDoc(currentCommitRef, {
        progress,
        success,
        fail,
    })
}

const handleUpdateUrl = (
    visualCheckId: string,
    projectId?: string,
    socket?: Server,
    url?: string
) => {
    try {
        const currentCommitRef = doc(db, `/visualchecks/${visualCheckId}`)
        if (url) {
            updateDoc(currentCommitRef, { screenshotingUrl: url, status: 0 })
            return
        }
        // screenshot done
        if (socket && !url) {
            socket.emit(`projectId-${projectId}-run-visual-done`, {
                visualCheckId,
            })

            updateDoc(currentCommitRef, {
                screenshotingUrl: null,
                finishAt: new Date().toString(),
                status: 1,
            })

            finishTask(visualCheckId)
        }
    } catch (error) {
        throw error
    }
}

export const handleCancelProgress = async (visualCheckId: string) => {
    try {
        const currentCommitRef = doc(db, `/visualchecks/${visualCheckId}`)

        await updateDoc(currentCommitRef, {
            screenshotingUrl: null,
            status: 2,
        })
    } catch (error) {
        throw error
    }
}

const handleEmitImageProcessStartEvent = async (
    currentProcessingUrl: string,
    visualCheckId: string,
    projectId: string,
    socket: Server
) => {
    socket.emit(`projectId-${projectId}-image-process-start`, {
        currentProcessingUrl,
        visualCheckId,
    })
}

const handleEmitImageProcessEndEvent = async (
    updateCommitValues: CommitValuesType,
    visualCheckId: string,
    pageSnapId: string,
    projectId: string,
    socket: Server
) => {
    try {
        const [updatedCommit, updatedPageSnap] = await Promise.all([
            handleGetCommit(visualCheckId),
            handleGetPageSnap(visualCheckId, pageSnapId),
        ])

        const { fail, success, completed, commitsTotal } = updateCommitValues
        const progress = Math.round((completed / commitsTotal) * 100)

        if (updatedCommit) {
            updatedCommit.fail = fail
            updatedCommit.success = success
            updatedCommit.progress = progress
        }

        socket.emit(`projectId-${projectId}-image-process-end`, {
            updatedPageSnap,
            updatedCommit,
            visualCheckId,
            pageSnapId,
        })
    } catch (error) {
        throw error
    }
}

const handleGetCommit = async (
    visualCheckId: string
): Promise<Omit<CommitType, 'pageSnapshots'>> => {
    try {
        const commitRef = doc(db, `/visualchecks/${visualCheckId}`)
        const commitSnap = await getDoc(commitRef)
        const commit = commitSnap.data()

        return {
            id: commitSnap.id,
            fail: commit?.fail ?? 0,
            success: commit?.success ?? 0,
            progress: commit?.progress ?? 0,
            projectId: commit?.projectId ?? '',
            screenshotingUrl: commit?.screenshotingUrl ?? '',
            userId: commit?.userId ?? '',
        }
    } catch (error) {
        throw error
    }
}

const handleGetPageSnap = async (
    visualCheckId: string,
    pageSnapId: string
): Promise<CommitPageSnapshotType> => {
    try {
        const pagesSnapshotRef = doc(
            db,
            `/visualchecks/${visualCheckId}/pagesnapshots/${pageSnapId}`
        )

        const pagesSnapshotSnap = await getDoc(pagesSnapshotRef)
        const pageSnap = pagesSnapshotSnap.data()

        return {
            id: pagesSnapshotSnap.id,
            diff: pageSnap?.diff ?? 0,
            match: pageSnap?.match ?? 0,
            url: pageSnap?.url ?? '',
            path: pageSnap?.path ?? '',
            createdAt: pageSnap?.createdAt ?? '',
            diffImage: pageSnap?.diffImage ?? '',
            diffPixel: pageSnap?.diffPixel ?? 0,
            currentBasePath: pageSnap?.currentBasePath ?? '',
        }
    } catch (error) {
        throw error
    }
}

const handleScreenshot = async (url: string, projectId: string) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-first-run',
                '--no-sandbox',
                '--no-zygote',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        })
        const page = await browser.newPage()
        await page.setViewport({ width: 1920, height: 1080 })
        await page.goto(url, { waitUntil: 'networkidle2' })
        // await autoScroll(page)
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true,
        })

        await browser.close()

        const screenshotRef = ref(
            storage,
            `screenshots/screenshot-${projectId}-${Date.now()}.png`
        )

        const snapshot = await uploadBytes(screenshotRef, screenshot)
        const downloadURL = await getDownloadURL(snapshot.ref)

        return {
            createdAt: new Date().toString(),
            path: downloadURL,
            url: url,
            match: 0,
            diff: 0,
        }
    } catch (error) {
        throw error
    }
}

const handleCreteSubCollection = async (visualCheckId: string) => {
    return await new Promise<void>(async (resolve) => {
        admin
            .firestore()
            .collection('visualchecks')
            .doc(`${visualCheckId}`)
            .collection('pagesnapshots')
        resolve()
    })
}
