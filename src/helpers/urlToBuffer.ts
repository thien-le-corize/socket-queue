import jimp from 'jimp'

export const urlToBuffer = async (url: string): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        await jimp.read(url, async (err, image) => {
            if (err) {
                console.log(`error reading image in jimp: ${err}`)
                reject(err)
            }

            image.resize(400, 400)
            return image.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                if (err) {
                    console.log(`error converting image url to buffer: ${err}`)
                    reject(err)
                }
                resolve(buffer)
            })
        })
    })
}
