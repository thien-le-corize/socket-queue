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

export type CommitValuesType = {
    success: number
    fail: number
    completed: number
    commitsTotal: number
}

export type CommitPageSnapshotType = {
    id: string
    diff: number
    match: number
    url: string
    path: string
    createdAt: string
    currentBasePath: string
    diffImage: string
    diffPixel: number
}

export type CommitType = {
    id: string
    success: number
    userId: string
    projectId: string
    progress: number
    screenshotingUrl: string | null
    fail: number
    pageSnapshots: CommitPageSnapshotType[]
    createdAt?: string
    finishAt?: string
    status?: number
}
