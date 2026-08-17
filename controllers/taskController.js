const { ValidationError, NotFoundError } = require("../middleware/errors");
const respondWithError = require("../middleware/respond-with-error");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

const taskSelect = {
    id: true,
    title: true,
    isCompleted: true,
};

async function create(req, res, next) {
    try {
        const { error, value } = taskSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const details = error.details.map((detail) => detail.message);
            throw new ValidationError("Task validation failed.", details);
        }

        const { title, isCompleted } = value;

        const task = await prisma.task.create({
            data: {
                title,
                isCompleted,
                userId: global.user_id,
            },
            select: taskSelect,
        });

        return res.status(201).json(task);
    } catch (err) {
        if (err.code === "P2002") {
            return respondWithError(res, new ValidationError("Task already exists."), next);
        }

        return respondWithError(res, err, next);
    }
}

async function index(req, res, next) {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: global.user_id,
            },
            select: taskSelect,
        });

        if (tasks.length === 0) {
            throw new NotFoundError("User tasks not found");
        }

        return res.status(200).json(tasks);
    } catch (err) {
        return respondWithError(res, err, next);
    }
}

async function show(req, res, next) {
    try {
        const taskId = parseInt(req.params.id);

        if (Number.isNaN(taskId)) {
            throw new ValidationError("Invalid task id");
        }

        const result = await prisma.task.findFirst({
            where: {
                id: taskId,
                userId: global.user_id,
            },
            select: taskSelect,
        });

        if (!result) {
            throw new NotFoundError("The task was not found");
        }

        return res.status(200).json(result);
    } catch (err) {
        return respondWithError(res, err, next);
    }
}

async function update(req, res, next) {
    try {
        const { error, value } = patchTaskSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const details = error.details.map((detail) => detail.message);
            throw new ValidationError("Failed to update task", details);
        }

        const taskId = parseInt(req.params.id);
        if (Number.isNaN(taskId)) {
            throw new ValidationError("Invalid task id");
        }

        const data = {};
        if (value.title !== undefined) {
            data.title = value.title;
        }
        if (value.isCompleted !== undefined) {
            data.isCompleted = value.isCompleted;
        }

        const updatedTask = await prisma.task.update({
            data,
            where: {
                id_userId: {
                    id: taskId,
                    userId: global.user_id,
                },
            },
            select: taskSelect,
        });

        return res.status(200).json(updatedTask);
    } catch (err) {
        if (err.code === "P2025") {
            return respondWithError(res, new NotFoundError("The task was not found."), next);
        }

        return respondWithError(res, err, next);
    }
}

async function deleteTask(req, res, next) {
    try {
        const taskId = parseInt(req.params.id);
        if (Number.isNaN(taskId)) {
            throw new ValidationError("Invalid task id");
        }

        const result = await prisma.task.delete({
            where: {
                id_userId: {
                    id: taskId,
                    userId: global.user_id,
                },
            },
            select: taskSelect,
        });

        return res.status(200).json(result);
    } catch (err) {
        if (err.code === "P2025") {
            return respondWithError(res, new NotFoundError("The task was not found."), next);
        }

        return respondWithError(res, err, next);
    }
}

module.exports = {
    create,
    index,
    show,
    update,
    deleteTask,
};
