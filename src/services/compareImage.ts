import { urlToBuffer } from '../helpers/urlToBuffer'
import pixelMatch from 'pixelmatch'
import { PNG } from 'pngjs'
import fs from 'fs'

const img1 =
    'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
const img2 =
    'https://images.pexels.com/photos/381739/pexels-photo-381739.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'

export const compareImage = async () => {
    try {
        const [image1Buffer, image2Buffer] = await Promise.all([
            urlToBuffer(img1),
            urlToBuffer(img2),
        ])

        const imgA = PNG.sync.read(image1Buffer)
        const imgB = PNG.sync.read(image2Buffer)

        const { width, height } = imgA
        const diff = new PNG({ width, height })
        // console.log(diff.data)

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

        const compatibility = 100 - (difference * 100) / (width * height)
        fs.writeFileSync('diff.png', PNG.sync.write(diff))
        // console.log(diff.data)
        // console.log(`${difference} pixels differences`)
        // console.log(`Compatibility: ${compatibility}%`)
        // console.log('< Completed comparing two images')
        return diff
    } catch (error) {
        // console.log(error)
        throw error
    }
}
