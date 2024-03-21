import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import cors from '@fastify/cors'
import runVisualController from '../controllers/runVisualController'
import { compareImage } from '../services/compareImage'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import cfrsProtection from '@fastify/csrf-protection'

const PORT = Number(process.env.PORT) || 3001

const buildServer = async () => {
    const server = await fastify({ logger: true })

    await Promise.all([
        server.register(cors, { origin: '*' }),
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
        })
        app.listen({ port: PORT }, (err, address) => {
            console.log(`Server listening at ${address}`)
        })
    } catch (error) {
        if (error) {
            console.error(error)
            process.exit(1)
        }
    }
}

main()
