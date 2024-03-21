import fastify from 'fastify'
import { initFirebaseAdmin } from '../firebase/admin'
import { Server, Socket } from 'socket.io'
import cors from '@fastify/cors'
import fastifySocketIO from 'fastify-socket.io'
import runVisualController from '../controllers/runVisualController'

const PORT = Number(process.env.PORT) || 3000

const buildServer = async () => {
    const servers = await fastify({ logger: true })
    await servers.register(cors, {
        origin: ['http://localhost:3000', 'https://socket-queue.onrender.com'],
    })
    await servers.register(fastifySocketIO)

    await servers.register(runVisualController, {
        prefix: '/run-visual-snapshots',
    })

    return servers
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

        app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
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
