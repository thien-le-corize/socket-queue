import { UrlToBuffer } from '@/types'
import jimp from 'jimp'

const DEFAULT_WIDTH = 1000

export const urlToBuffer = async (url: string): Promise<UrlToBuffer> => {
    return new Promise(async (resolve, reject) => {
        await jimp.read(url, async (err, image) => {
            if (err) {
                console.log(`error reading image in jimp: ${err}`)
                reject(err)
            }

            const { width, height } = image.bitmap
            const newWidth = DEFAULT_WIDTH
            const newHeight = Math.round((newWidth * height) / width)
            image.resize(newWidth, newHeight)

            return image.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                if (err) {
                    console.log(`error converting image url to buffer: ${err}`)
                    reject(err)
                }
                resolve({ buffer, bitmap: image.bitmap })
            })
        })
    })
}
