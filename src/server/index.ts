import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import { Server, Socket } from 'socket.io'
import cors from '@fastify/cors'
import fastifySocketIO from 'fastify-socket.io'
import runVisualController from '../controllers/runVisualController'
import { compareImage } from '../services/compareImage'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import cfrsProtection from '@fastify/csrf-protection'

const PORT = 3000

const buildServer = async () => {
    const server = await fastify({ logger: true })

    await Promise.all([
        server.register(fastifySocketIO),
        server.register(cors, {
            origin: [
                'https://webdiff-lovat.vercel.app',
                'http://localhost:3000',
            ],
        }),
        server.register(fastifyCookie, { secret: 'xyz' }),
        server.register(fastifyCompress, { global: true }),
        server.register(fastifyHelmet, {
            global: true,
            contentSecurityPolicy: true,
        }),
        server.register(cfrsProtection, {
            cookieOpts: { signed: true },
            cookieKey: 'csrfToken',
        }),
        server.register(runVisualController, {
            prefix: '/run-visual-snapshots',
        }),
    ])

    server.get('/', async (request, reply) => {
        const base64 = await compareImage()

        reply.status(200).send({ message: 'ok', data: base64 })
    })

    return server
}

const main = async () => {
    const app = await buildServer()

    try {
        app.ready((error) => {
            if (error) throw error

            initFirebaseAdmin()

            app.io.on('connection', (socket: Socket) => {
                console.log('Socket connected!', socket.id)

                socket.on('disconnect', (message) => {
                    console.log(message)
                })
            })
        })
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server listening on port ${PORT}`)
        })
    } catch (error) {
        if (error) {
            console.error(error)
            process.exit(1)
        }
    }
}

main()

declare module 'fastify' {
    interface FastifyInstance {
        io: Server<any>
    }
}
