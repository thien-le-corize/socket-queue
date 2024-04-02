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
import { SCREENSHOT_STATUS_TYPE } from '../types'
import { Server } from 'socket.io'
import {
    finishTask,
    isTaskRunning,
} from '../controllers/taskManager/taskManager'
import { keyBy } from '../helpers/keyBy'
import { compareImage } from './compareImage'

export const handleCreateNewVisualCheck = async (
    projectId: string,
    userId: string
) => {
    try {
        const newVisualCheck = {
            fail: 0,
            progress: 0,
            projectId,
            status: 0,
            success: 0,
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

        console.log(basePageSnapshots)
        const basePageSnapsUrlsObject = keyBy(basePageSnapshots, 'url')

        for (const basePageSnapshot of basePageSnapshots) {
            const pageSnapshot = {
                ...defaultPageSnapshot,
                createdAt: new Date().toString(),
                currentBasePath:
                    basePageSnapsUrlsObject[basePageSnapshot.url].path,
                url: basePageSnapshot.url,
            }
            const pageSnapShotSnap = await addDoc(
                commitPagesSnapshotsRef,
                pageSnapshot
            )
        }

        return visualCheckId
    } catch (error) {
        throw error
    }
}

export const handleUpdatePageSnapshotDocs = async (
    visualCheckId: string,
    projectId: string,
    socket: Server
) => {
    try {
        const commitPagesSnapshotsRef = collection(
            db,
            `/visualchecks/${visualCheckId}/pagesnapshots`
        )

        const commitPagesSnapshotsSnap = await getDocs(commitPagesSnapshotsRef)

        const commitPagesSnapshots = commitPagesSnapshotsSnap.docs.map(
            (doc) => {
                const data = doc.data()

                return {
                    id: doc.id,
                    url: data.url,
                    path: data.path,
                    currentBasePath: data.currentBasePath,
                }
            }
        )

        console.log(commitPagesSnapshots)

        for (const commitPagesSnapshot of commitPagesSnapshots) {
            if (!isTaskRunning(visualCheckId)) {
                break
            }

            const pageSnapshotId = commitPagesSnapshot.id

            handleUpdateProgress(visualCheckId, commitPagesSnapshot.url)

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
                `/visualchecks/${visualCheckId}/pagesnapshots/${pageSnapshotId}`
            )

            await updateDoc(pagesSnapshotsRef, {
                ...screenshotData,
                ...compareImageData,
            })

            handleEmitEvent(visualCheckId, pageSnapshotId, socket)
        }
        finishTask(visualCheckId)
        handleUpdateProgress(visualCheckId)
    } catch (error) {
        // throw error
    }
}

const handleUpdateProgress = async (visualCheckId: string, url?: string) => {
    try {
        const currentCommitRef = doc(db, `/visualchecks/${visualCheckId}`)

        if (url) {
            await updateDoc(currentCommitRef, { screenshotingUrl: url })
        } else {
            await updateDoc(currentCommitRef, { screenshotingUrl: null })
        }
    } catch (error) {
        throw error
    }
}

export const handleCancelProgress = async (visualCheckId: string) => {
    try {
        const currentCommitRef = doc(db, `/visualchecks/${visualCheckId}`)

        const res = await updateDoc(currentCommitRef, {
            screenshotingUrl: null,
        })
        console.log(res)
    } catch (error) {
        throw error
    }
}

const handleEmitEvent = async (
    visualCheckId: string,
    pageSnapId: string,
    socket: Server
) => {
    try {
        const updatedData = await handleGetPageSnap(visualCheckId, pageSnapId)
        socket.emit('updated-page-snapshot-data', updatedData)
    } catch (error) {
        throw error
    }
}

const handleGetPageSnap = async (visualCheckId: string, pageSnapId: string) => {
    try {
        const pagesSnapshotRef = doc(
            db,
            `/visualchecks/${visualCheckId}/pagesnapshots/${pageSnapId}`
        )

        const pagesSnapshotSnap = await getDoc(pagesSnapshotRef)
        return pagesSnapshotSnap.data()
    } catch (error) {
        return
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
