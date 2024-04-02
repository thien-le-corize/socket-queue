export type CreatePageSnapRequestBody = {
    visualCheckId: string
    projectId: string
    userId: string
    urlList: string[]
}

export type ScreenshotRequestBody = {
    visualCheckId: string
    projectId: string
    userId: string
}

export type UrlToBuffer = {
    buffer: Buffer
    bitmap: any
}

export const SCREENSHOT_STATUS_TYPE = {
    doing: 'doing',
    done: 'done',
    fail: 'fail',
} as const

export type SCREENSHOT_STATUS_TYPE = keyof typeof SCREENSHOT_STATUS_TYPE
