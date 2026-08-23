const { ValidationError, NotFoundError } = require('../middleware/errors')
const { taskSchema, patchTaskSchema } = require('../validation/taskSchema')

function create(req, res) {
    const user = req.user

    const { error, value } = taskSchema.validate(req.body, {
        abortEarly: false
    })

    if (error) {
        const details = error.details.map((detail) => detail.message)
        throw new ValidationError(
            'Task validation failed.',
            details
        )
    }

    const { title, isCompleted } = value

    const task = {
        id: taskCounter(),
        userId: user.email,
        title,
        isCompleted
    }

    global.tasks.push(task)

    const { userId, ...sanitizedTask } = task

    return res.status(201).json({
        task: sanitizedTask
    })
}

function index(req, res) {
    const user = req.user
    const userTasks = global.tasks.filter(task => task.userId === user.email)

    if (userTasks.length === 0) {
        throw new NotFoundError('User tasks not found')
    }

    const userTasksFiltered = []

    for (const tasks of userTasks) {
        const { userId, ...sanitizedTask } = tasks
        userTasksFiltered.push(sanitizedTask)
    }


    return res.status(200).json({
        tasks: userTasksFiltered
    })
}

function show(req, res) {
    const taskId = parseInt(req.params.id)

    if (Number.isNaN(taskId)) {
        throw new ValidationError(`Invalid task id`)
    }

    const user = req.user
    const task = global.tasks.find(task => task.id === taskId && task.userId === user.email)


    if (!task) {
        throw new NotFoundError(`Missing or invalid task id`)
    }

    const { userId, ...sanitizedTask } = task

    return res.status(200).json({
        task: sanitizedTask
    })

}

function update(req, res) {
    const { error, value } = patchTaskSchema.validate(req.body, {
        abortEarly: false
    })

    if (error) {
        const details = error.details.map((detail) => detail.message)
        throw new ValidationError(
            'Failed to update task',
            details
        )
    }

    const taskId = parseInt(req.params.id)
    if (Number.isNaN(taskId)) {
        throw new ValidationError(`Invalid task id`)
    }

    const user = req.user
    const task = global.tasks.find((task) => task.id === taskId && task.userId === user.email)

    if (!task) {
        throw new NotFoundError(`Missing or invalid task`)
    }


    Object.assign(task, value)

    const { userId, ...sanitizedTask } = task

    return res.status(200).json({
        task: sanitizedTask
    })
}

function deleteTask(req, res) {
    const taskId = parseInt(req.params.id)
    if (Number.isNaN(taskId)) {
        throw new ValidationError(`Invalid task id`)
    }

    const user = req.user
    const taskIndex = global.tasks.findIndex(task => task.id === taskId && task.userId === user.email)

    if (taskIndex === -1) {
        throw new NotFoundError(`Missing or invalid task id`)
    }

    const { userId, ...sanitizedTask } = global.tasks[taskIndex]

    global.tasks.splice(taskIndex, 1)

    return res.status(200).json({
        deletedTask: sanitizedTask
    })
}

const taskCounter = (() => {
    let lastTaskNumber = 0

    return () => {
        lastTaskNumber += 1
        return lastTaskNumber
    }
})()

module.exports = {
    create,
    index,
    show,
    update,
    deleteTask
};