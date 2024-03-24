import {
    handleAddPageSnapshotDocs,
    handleCancelProgress,
    handleCreateNewVisualChecks,
    handleUpdatePageSnapshotDocs,
} from '../services/screenshot'
import { CreatePageSnapRequestBody, ScreenshotRequestBody } from '@/types'
import { FastifyInstance } from 'fastify/types/instance'
const {
    startTask,
    isTaskRunning,
    cancelTask,
    finishTask,
    getTask,
} = require('./taskManager/taskManager')

const runVisualController = (
    server: FastifyInstance,
    options: any,
    done: () => void
) => {
    server.post('/', async (request, reply) => {
        const { urlList, userId, projectId, visualCheckId } =
            request.body as ScreenshotRequestBody

        console.log(urlList, userId, projectId, visualCheckId)
        if (!urlList.length || !userId || !projectId || !visualCheckId) {
            reply.status(400).send({ message: 'Bad request' })
        }

        try {
            startTask(visualCheckId)
            await handleUpdatePageSnapshotDocs(
                urlList,
                visualCheckId,
                projectId,
                server.io
            )
            console.log('Task started:', visualCheckId)
            reply.status(201).send({ message: 'OK' })
        } catch (error) {
            cancelTask(visualCheckId)
            console.log(error)
            throw error
        }
    })

    server.post('/create-visual-page-snapshot', async (request, reply) => {
        const { urlList, userId, projectId } =
            request.body as CreatePageSnapRequestBody

        if (!urlList.length || !userId || !projectId) {
            console.log(urlList, userId, projectId)
            reply.status(400).send({ message: 'Bad request' })
        }

        try {
            const visualCheckId = await handleCreateNewVisualChecks(
                projectId,
                userId
            )
            startTask(visualCheckId)
            console.log('Task started:', visualCheckId)
            const formatedUrlList = await handleAddPageSnapshotDocs(
                visualCheckId,
                urlList
            )
            finishTask(visualCheckId)
            console.log('Task started:', visualCheckId)
            reply.status(201).send({
                message: 'OK',
                data: { urlList: formatedUrlList, visualCheckId },
            })
        } catch (error) {
            throw error
        }
    })
    server.post('/cancel-visual-page-snapshot', async (request, reply) => {
        const { visualCheckId } = request.body as { visualCheckId: string }
        try {
            cancelTask(visualCheckId)
            await handleCancelProgress(visualCheckId)
            reply.send({
                message: `Task ${visualCheckId} cancelled`,
                data: true,
            })
        } catch (error) {
            reply.send({ message: `error`, data: false })
        }
    })

    server.post('/get-task', async (request, reply) => {
        const { visualCheckId } = request.body as { visualCheckId: string }
        const task = getTask(visualCheckId)

        try {
            if (!task || !isTaskRunning(visualCheckId)) {
                await handleCancelProgress(visualCheckId)
                cancelTask(visualCheckId)
                reply
                    .status(404)
                    .send({ message: 'Task not found', data: false })
            }

            reply.send({
                message: `Task ${visualCheckId} runing status`,
                data: task,
            })
        } catch (error) {
            console.log(error)
            throw error
        }
    })

    done()
}

export default runVisualController
