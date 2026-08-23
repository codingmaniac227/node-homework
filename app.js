const express = require('express')
const userRouter = require('./routes/userRoutes')
const taskRouter = require('./routes/taskRoutes')
const notFound = require('./middleware/not-found.js')
const errorHandler = require('./middleware/error-handler')
const authMiddleware = require('./middleware/auth')

global.user_id = null
global.users = []
global.tasks = []


const app = express()


app.use(express.json())
app.use('/api/users', userRouter)
app.use('/api/tasks', authMiddleware, taskRouter)


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

module.exports = { app, server }