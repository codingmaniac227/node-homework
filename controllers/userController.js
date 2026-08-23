const { userSchema } = require("../validation/userSchema");
const { ValidationError, UnauthorizedError } = require('../middleware/errors')
const { hashPassword, comparePassword } = require('../utils/hashPassword')

async function register(req, res) {
    if (!req.body)  {
        req.body = {};
    }

    const { error, value } = userSchema.validate(req.body, {
        abortEarly: false
    })

    if (error) {
        throw new ValidationError(`User validation failed: ${error}`)
    }


    const { name, email, password } = value

    const hashedPassword = await hashPassword(password)


    let user = { id: global.users.length + 1, name, email, hashedPassword };
    global.users.push(user)
    global.user_id = user


    res.status(201).json({
        name: name,
        email: email
    })
}

async function logon(req, res) {
    const { email, password } = req.body;

    const user = global.users.find(
        (user) =>
            user.email === email
    )

    if (!user) {
        return res.status(401).end()
    }

    const goodCredentials = user && await comparePassword(
        password,
        user.hashedPassword,
    )

    if (!goodCredentials) {
        throw new UnauthorizedError(`Invalid password`)
    }

    global.user_id = user

    return res.status(200).json({
        name: user.name,
        email: user.email
    })
}

function logoff(req, res) {
    global.user_id = null

    return res.status(200).end()
}

module.exports = { register, logon, logoff }