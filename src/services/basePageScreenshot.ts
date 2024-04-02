import db, { storage } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import puppeteer, { Browser } from 'puppeteer'
import { SCREENSHOT_STATUS_TYPE } from '../types'
import { Server } from 'socket.io'

type GlobalValuesType = {
    message: string
    browser: Browser | null
    pageScreenshotPath: string
    status: SCREENSHOT_STATUS_TYPE
}

export const screenshotPage = async (
    projectId: string,
    pageSnapshotId: string,
    io: Server
) => {
    const globalValues: GlobalValuesType = {
        message: '',
        browser: null,
        pageScreenshotPath: '',
        status: SCREENSHOT_STATUS_TYPE.doing,
    }

    try {
        const url = await handleGetPageSnapshotUrl(projectId, pageSnapshotId)

        if (!url) {
            throw new Error('url not found')
        }

        globalValues.browser = await puppeteer.launch({
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

        const page = await globalValues.browser.newPage()
        await page.setViewport({ width: 1920, height: 1080 })
        await page.goto(url, { waitUntil: 'networkidle2' })
        // await autoScroll(page)

        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true,
        })

        const screenshotName = `base-pageSnapshot-${Date.now().toString()}.png`
        const screenshotRef = ref(storage, `screenshots/${screenshotName}`)
        const snapshot = await uploadBytes(screenshotRef, screenshot)
        const downloadURL = await getDownloadURL(snapshot.ref)
        globalValues.pageScreenshotPath = downloadURL
        const pageSnapshotRef = handleGetPageSnapRef(projectId, pageSnapshotId)

        await updateDoc(pageSnapshotRef, {
            path: downloadURL,
            screenshotStatus: SCREENSHOT_STATUS_TYPE.done,
        })

        globalValues.status = SCREENSHOT_STATUS_TYPE.done
        globalValues.message = ' page screenshot successfully'
    } catch (error: any) {
        handleScreenshotError(projectId, pageSnapshotId)
        globalValues.status = SCREENSHOT_STATUS_TYPE.fail
        globalValues.message = error.message
        throw error
    } finally {
        if (globalValues.browser) {
            await globalValues.browser.close()
            globalValues.browser = null
        }

        handleEmit(
            projectId,
            pageSnapshotId,
            globalValues.status,
            globalValues.pageScreenshotPath,
            globalValues.message,
            io
        )
    }
}

const handleEmit = (
    projectId: string,
    pageVisualSnapId: string,
    status: SCREENSHOT_STATUS_TYPE,
    pageScreenshotPath: string,
    message: string,
    io: Server
) => {
    const emitData = {
        status,
        message,
        projectId,
        pageVisualSnapId,
        pageScreenshotPath,
    }

    io.emit(`projectId-${projectId}-add-page-snapshot`, emitData)
}

const handleScreenshotError = async (
    projectId: string,
    pageSnapshotId: string
) => {
    try {
        const pageSnapshotRef = handleGetPageSnapRef(projectId, pageSnapshotId)
        await updateDoc(pageSnapshotRef, {
            screenshotStatus: SCREENSHOT_STATUS_TYPE.fail,
        })
    } catch (error) {
        throw error
    }
}

const handleGetPageSnapRef = (projectId: string, pageSnapshotId: string) =>
    doc(db, `/projects/${projectId}/pageSnapShot/${pageSnapshotId}`)

const handleGetPageSnapshotUrl = async (
    projectId: string,
    pageSnapshotId: string
): Promise<string> => {
    try {
        const pageSnapshotRef = handleGetPageSnapRef(projectId, pageSnapshotId)
        const pageSnapshotSnap = await getDoc(pageSnapshotRef)
        return pageSnapshotSnap.data()?.url
    } catch (error) {
        throw error
    }
}
