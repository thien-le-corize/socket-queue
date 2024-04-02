import { Page } from 'puppeteer'

export const autoScroll = async (page: Page): Promise<void> => {
    await page.evaluate(async () => {
        await new Promise<void>((resolve, reject) => {
            var totalHeight = 0
            var distance = 100
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight
                window.scrollBy(0, distance)
                totalHeight += distance

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })
    })
}
