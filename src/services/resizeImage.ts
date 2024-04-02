import sharp from 'sharp'

export const handleResizeImage = (
    image: Buffer,
    width: number,
    height: number
): Promise<Buffer> => {
    return new Promise((resolve) => {
        sharp(image)
            .resize(width, height, { fit: 'contain', position: 'left top' })
            .toBuffer()
            .then((data) => {
                resolve(data)
            })
    })
}
