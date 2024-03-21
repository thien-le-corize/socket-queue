import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import cors from '@fastify/cors'
import runVisualController from '../controllers/runVisualController'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import cfrsProtection from '@fastify/csrf-protection'

const PORT = 3000

const buildServer = async () => {
    const server = await fastify({ logger: false })

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

    return server
}

const main = async () => {
    const app = await buildServer()

    try {
        app.ready((error) => {
            if (error) throw error

            initFirebaseAdmin()
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
