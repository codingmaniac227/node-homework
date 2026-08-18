const express = require('express')
const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRoutes')
const notFound = require('./middleware/not-found.js')
const errorHandler = require('./middleware/error-handler')
const authMiddleware = require('./middleware/auth')
const pool = require('./db/pg-pool')
const prisma = require('./db/prisma')


global.user_id = null


const app = express()


app.use(express.json())
app.use('/api/users', userRouter)
app.use('/api/tasks', authMiddleware, taskRouter)

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({ status: 'ok', db: 'connected' })
    } catch (err) {
        res.status(500).json({ status: 'error', db: 'not connected', error: err.message})
    }
})


app.use(notFound)
app.use(errorHandler)

    const port = 3000

    const server = app.listen(port, () => {
        console.log(`Server is listening on port ${port}`)
    })

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use.`)
        } else {
            console.error('Server error:', err)
        }
        process.exit(1)
    })

    const shutdown = async () => {
        server.close()
        await pool.end()
        process.exit(0)
        await prisma.$disconnect()
        console.log('Prisma disconnected')
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

module.exports = { app, server }
