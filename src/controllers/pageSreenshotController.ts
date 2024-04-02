import { screenshotPage } from '../services/basePageScreenshot'
import { FastifyInstance } from 'fastify/types/instance'

export const pageScreenshotController = (
    server: FastifyInstance,
    options: any,
    done: () => void
) => {
    server.route({
        method: 'POST',
        url: '/',
        schema: {
            body: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' },
                    pageSnapshotId: { type: 'string' },
                },
                required: ['projectId', 'pageSnapshotId'],
            },
            response: {
                200: {
                    properties: {
                        url: { type: 'string' },
                    },
                    required: ['url'],
                },
            },
        },
        handler: async (request, reply) => {
            const { projectId, pageSnapshotId } = request.body as BodyType

            try {
                const url = await screenshotPage(
                    projectId,
                    pageSnapshotId,
                    server.io
                )

                reply
                    .status(200)
                    .send({ message: 'Screenshot successfully', url })
            } catch (error) {
                reply.status(400).send(error)
            }
        },
    })

    done()
}

type BodyType = {
    projectId: string
    pageSnapshotId: string
}
