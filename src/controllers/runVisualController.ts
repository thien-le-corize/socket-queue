import {
    handleAddPageSnapshotDocs,
    handleCancelProgress,
    handleCreateNewVisualCheck,
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
        const { userId, projectId, visualCheckId } =
            request.body as ScreenshotRequestBody

        if (!userId || !projectId || !visualCheckId) {
            reply.status(400).send({ message: 'Bad request' })
        }

        try {
            startTask(visualCheckId)
            await handleUpdatePageSnapshotDocs(
                visualCheckId,
                projectId,
                server.io
            )
            reply.status(201).send({ message: 'OK' })
        } catch (error) {
            cancelTask(visualCheckId)
            throw error
        }
    })

    server.post('/create-visual-page-snapshot', async (request, reply) => {
        const { userId, projectId } = request.body as CreatePageSnapRequestBody

        if (!userId || !projectId) {
            reply.status(400).send({ message: 'Bad request' })
        }

        try {
            const visualCheckId = await handleCreateNewVisualCheck(
                projectId,
                userId
            )
            startTask(visualCheckId)
            await handleAddPageSnapshotDocs(visualCheckId, projectId)
            finishTask(visualCheckId)
            reply.status(201).send({
                message: 'OK',
                data: { visualCheckId },
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
            throw error
        }
    })

    done()
}

export default runVisualController
