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
    const server = await fastify({ logger: true })
    await server.register(cors, { origin: 'http://localhost:3000' })
    await server.register(fastifySocketIO)

    await server.register(runVisualController, {
        prefix: '/run-visual-snapshots',
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
