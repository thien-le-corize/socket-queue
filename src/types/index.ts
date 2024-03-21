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
    urlList: UrlType[]
}

export type UrlType = {
    pageSnapshotId: string
    url: string
}
