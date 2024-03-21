import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import { Server, Socket } from 'socket.io'
import cors from '@fastify/cors'
import fastifySocketIO from 'fastify-socket.io'
import runVisualController from '../controllers/runVisualController'

const PORT = 10000

const buildServer = async () => {
    const server = await fastify({ logger: true })
    await server.register(cors, { origin: '*' })
    await server.register(fastifySocketIO)

    await server.register(runVisualController, {
        prefix: '/run-visual-snapshots',
    })

    await server.listen(10000, '0.0.0.0')
    console.log(`Server listening on http://0.0.0.0:10000`)

    return server
}

const main = async () => {
    const app = await buildServer()

    try {
        app.ready((error: any) => {
            if (error) throw error

            initFirebaseAdmin()

            app.io.on('connection', (socket: Socket) => {
                console.log('Socket connected!', socket.id)

                socket.on('disconnect', (message) => {
                    console.log(message)
                })
            })
        })
        app.get('/', (req, res) => {
            res.send(
                '<h1>Chào mừng đến với ứng dụng của tôi!</h1><p>Đây là một đoạn văn.</p>'
            )
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

declare module 'fastify' {
    interface FastifyInstance {
        io: Server<any>
    }
}
