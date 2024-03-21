import pixelMatch from 'pixelmatch'

export const compareImage = async () => {
    // resemble.compare

    const [imageBuffer1, imageBuffer2] = await Promise.all([
        urlToBuffer(img1),
        urlToBuffer(img2),
    ])

    // const numDiffPixels = pixelMatch(
    //     imageBuffer1,
    //     imageBuffer2,
    //     diff,
    //     800,
    //     600,
    //     {
    //         threshold: 0.1,
    //     }
    // )
    // const base64 = await getBase64Image()

    return 'base64'
}

const img1 =
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
const img2 =
    'https://images.pexels.com/photos/381739/pexels-photo-381739.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'

const urlToBuffer = async (imageUrl: string) => {
    const imageResponse = await fetch(imageUrl)
    return Buffer.from(await imageResponse.arrayBuffer())
}
