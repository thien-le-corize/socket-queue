import { rejects } from 'assert'
import sharp from 'sharp'

export const handleConvertToWebp = async (image: Buffer): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const webpData = await sharp(image)
                .webp({ effort: 6, quality: 80 })
                .toBuffer()
            resolve(webpData)
        } catch (error) {
            reject()
            throw error
        }
    })
}
