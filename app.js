const express = require('express')
const timeRouter = require('./routes/timeRoutes')
const userRouter = require('./routes/userRoutes')
const notFound = require('./middleware/not-found.js')
const errorHandler = require('./middleware/error-handler')


global.user_id = null
global.users = []
global.tasks = []


const app = express()


app.use(express.json())
app.use('/api', timeRouter)
app.use('/api/users', userRouter)


app.use(notFound)
app.use(errorHandler)

if (require.main === module) {
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
}


module.exports = { app }