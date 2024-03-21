import db, { storage } from '../firebase'
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import puppeteer from 'puppeteer'
import admin from 'firebase-admin'
import { defaultPageSnapshot } from '../constants'
import { UrlType } from '@/types'

export const handleCreateNewVisualChecks = async (
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
    urlList: string[]
) => {
    try {
        await handleCreteSubCollection(visualCheckId)

        const pagesSnapshotsRef = collection(
            db,
            `/visualchecks/${visualCheckId}/pagesnapshots`
        )

        const formatedUrlList = []

        for (const url of urlList) {
            const pageSnapshot = {
                ...defaultPageSnapshot,
                createdAt: new Date().toString(),
                url,
            }

            const pageSnapShotSnap = await addDoc(
                pagesSnapshotsRef,
                pageSnapshot
            )

            formatedUrlList.push({ pageSnapshotId: pageSnapShotSnap.id, url })
        }

        return formatedUrlList
    } catch (error) {
        throw error
    }
}

export const handleUpdatePageSnapshotDocs = async (
    urlList: UrlType[],
    visualCheckId: string,
    projectId: string
) => {
    try {
        for (const url of urlList) {
            handleUpdateProgress(visualCheckId, url.url)
            const screenshotData = await handleScreenshot(url.url, projectId)

            const pagesSnapshotsRef = doc(
                db,
                `/visualchecks/${visualCheckId}/pagesnapshots/${url.pageSnapshotId}`
            )

            await updateDoc(pagesSnapshotsRef, screenshotData)

            handleEmitEvent(visualCheckId, url.pageSnapshotId)
        }

        handleUpdateProgress(visualCheckId)
    } catch (error) {
        console.log(error)
        throw error
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

const handleEmitEvent = async (visualCheckId: string, pageSnapId: string) => {
    try {
        const updatedData = await handleGetPageSnap(visualCheckId, pageSnapId)
        // io.emit('updated-page-snapshot-data', updatedData)
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
    return await new Promise<void>(async (resolve, reject) => {
        admin
            .firestore()
            .collection('visualchecks')
            .doc(`${visualCheckId}`)
            .collection('pagesnapshots')
        resolve()
    })
}
