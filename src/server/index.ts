import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import cors from '@fastify/cors'
import runVisualController from '../controllers/runVisualController'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import cfrsProtection from '@fastify/csrf-protection'
import fastifySocketIO from 'fastify-socket.io'
import { Server } from 'socket.io'
import { pageScreenshotController } from '../controllers/pageSreenshotController'

const PORT = 3001

const buildServer = async () => {
    const server = await fastify({ logger: false })

    await Promise.all([
        server.register(fastifySocketIO),
        server.register(cors, {
            origin: [
                'http://localhost:3000',
                'https://webdiff-lovat.vercel.app',
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
        server.register(pageScreenshotController, {
            prefix: '/page-screenshot',
        }),
    ])

    return server
}

const main = async () => {
    const app = await buildServer()

    try {
        app.ready((error) => {
            if (error) throw error

            initFirebaseAdmin()

            app.io.on('connection', (socket: any) => {
                console.log('Socket connected!', socket.id)

                socket.on('disconnect', (message: string) => {
                    console.log(message)
                })
            })
        })

        app.get('/ping', async (request, reply) => {
            reply.send('<h1>Pong!</h1>')
        })
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server listening on port ${PORT}`)
        })
    } catch (error) {
        process.exit(1)
    }
}

main()

declare module 'fastify' {
    interface FastifyInstance {
        io: Server
    }
}
