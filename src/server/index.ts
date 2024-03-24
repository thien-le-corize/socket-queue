import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import cors from '@fastify/cors'
import runVisualController from '../controllers/runVisualController'
import { compareImage } from '../services/compareImage'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import cfrsProtection from '@fastify/csrf-protection'
import fastifySocketIO from 'fastify-socket.io'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT) || 3001

const buildServer = async () => {
    const server = await fastify({ logger: false })

    await Promise.all([
        server.register(fastifySocketIO),
        server.register(cors, { origin: 'http://localhost:3000' }),
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
        // console.log(base64.data.toString('base64'))

        console.log('MB: ' + base64.data.length / 1e6)
        reply
            .status(200)
            .send({ message: 'ok', data: "base64.data.toString('base64')" })
    })

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
        io: Server
    }
}
