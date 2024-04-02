import { urlToBuffer } from '../helpers/urlToBuffer'
import pixelMatch from 'pixelmatch'
import { PNG } from 'pngjs'
import { UrlToBuffer } from '@/types'
import { handleResizeImage } from './resizeImage'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

export const compareImage = async (baseUrl: string, compareUrl: string) => {
    try {
        const [imageABuffer, imageBBuffer] = await urlsToBuffer(
            baseUrl,
            compareUrl
        )

        const [resizedImageABuffer, resizedImageBBuffer] =
            await handleResizeImages(imageABuffer, imageBBuffer)

        const imgA = PNG.sync.read(resizedImageABuffer)
        const imgB = PNG.sync.read(resizedImageBBuffer)

        const { width, height } = imgA
        const diff = new PNG({ width, height })

        const difference = pixelMatch(
            imgA.data,
            imgB.data,
            diff.data,
            width,
            height,
            {
                threshold: 0.1,
            }
        )

        const { downloadURL } = await handleUploadImage(PNG.sync.write(diff))
        const compatibility = 100 - (difference * 100) / (width * height)

        return {
            match: compatibility,
            diff: 100 - compatibility,
            diffPixel: difference,
            diffImage: downloadURL,
        }
    } catch (error) {
        throw error
    }
}

const handleUploadImage = async (image: Buffer) => {
    const screenshotName = `diff-${Date.now()}.png`
    const screenshotRef = ref(storage, `screenshots/${screenshotName}`)
    const snapshot = await uploadBytes(screenshotRef, image)
    const downloadURL = await getDownloadURL(snapshot.ref)

    return { downloadURL }
}

const urlsToBuffer = async (img1: string, img2: string) => {
    try {
        const [imageA, imageB] = await Promise.all([
            urlToBuffer(img1),
            urlToBuffer(img2),
        ])

        return [imageA, imageB]
    } catch (error) {
        throw error
    }
}

const handleResizeImages = async (imageA: UrlToBuffer, imageB: UrlToBuffer) => {
    const newHeight = Math.max(imageA.bitmap.height, imageB.bitmap.height)

    try {
        const [resizedImageABuffer, resizedImageBBuffer] = await Promise.all([
            handleResizeImage(imageA.buffer, imageA.bitmap.width, newHeight),
            handleResizeImage(imageB.buffer, imageB.bitmap.width, newHeight),
        ])

        return [resizedImageABuffer, resizedImageBBuffer]
    } catch (error) {
        throw error
    }
}
