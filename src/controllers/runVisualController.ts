import {
    handleAddPageSnapshotDocs,
    handleCreateNewVisualChecks,
    handleUpdatePageSnapshotDocs,
} from '../services/screenshot'
import { CreatePageSnapRequestBody, ScreenshotRequestBody } from '@/types'
import { FastifyInstance } from 'fastify/types/instance'

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
            await handleUpdatePageSnapshotDocs(
                urlList,
                visualCheckId,
                projectId
            )

            reply.status(201).send({ message: 'OK' })
        } catch (error) {
            console.log(error)
            throw error
        }
    })
    server.get('/test', async (request, reply) => {
        reply.status(200).send({ message: 'connected ok' })
    })
    server.post('/test', async (request, reply) => {
        const { userId } = request.body
        reply.status(200).send({ message: 'connected ok', data: userId })
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

            const formatedUrlList = await handleAddPageSnapshotDocs(
                visualCheckId,
                urlList
            )

            reply.status(201).send({
                message: 'OK',
                data: { urlList: formatedUrlList, visualCheckId },
            })
        } catch (error) {
            throw error
        }
    })

    done()
}

export default runVisualController
