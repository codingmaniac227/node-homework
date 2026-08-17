const { userSchema } = require("../validation/userSchema");
const { ValidationError, UnauthorizedError } = require("../middleware/errors");
const respondWithError = require("../middleware/respond-with-error");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const prisma = require("../db/prisma");

async function register(req, res, next) {
    try {
        if (!req.body) {
            req.body = {};
        }

        const { error, value } = userSchema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const details = error.details.map((detail) => detail.message);
            throw new ValidationError("User validation failed.", details);
        }

        const { email, name, password } = value;
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            },
        });

        global.user_id = user.id;

        return res.status(201).json({
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        if (err.name === "PrismaClientKnownRequestError" && err.code === "P2002") {
            return respondWithError(res, new ValidationError("Email already registered"), next);
        }

        return respondWithError(res, err, next);
    }
}

async function logon(req, res, next) {
    try {
        let { email, password } = req.body;

        email = email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new UnauthorizedError("Authentication failed");
        }

        const goodCredentials = await comparePassword(password, user.hashedPassword);

        if (!goodCredentials) {
            throw new UnauthorizedError("Authentication failed");
        }

        global.user_id = user.id;

        return res.status(200).json({
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        return respondWithError(res, err, next);
    }
}

function logoff(req, res) {
    global.user_id = null;

    return res.status(200).end();
}

module.exports = { register, logon, logoff };
