const { userSchema } = require("../validation/userSchema");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const pool = require("../db/pg-pool");

async function register(req, res, next) {
    if (!req.body) {
        req.body = {};
    }

    const { error, value } = userSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {
        return res.status(400).json({
            message: "Validation failed",
            details: error.details,
        });
    }

    value.hashed_password = await hashPassword(value.password);

    let user = null;
    try {
        user = await pool.query(
            `INSERT INTO users (email, name, hashed_password)
      VALUES ($1, $2, $3) RETURNING id, email, name`,
            [value.email, value.name, value.hashed_password]
        );
    } catch (e) {
        if (e.code === "23505") {
            return res.status(400).json({
                message: "Email already registered",
            });
        }
        return next(e);
    }

    global.user_id = user.rows[0].id;

    return res.status(201).json({
        name: user.rows[0].name,
        email: user.rows[0].email,
    });
}

async function logon(req, res) {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]);

    if (result.rows.length === 0) {
        return res.status(401).json({
            message: "Authentication failed",
        });
    }

    const user = result.rows[0];
    const goodCredentials = await comparePassword(password, user.hashed_password);

    if (!goodCredentials) {
        return res.status(401).json({
            message: "Authentication failed",
        });
    }

    global.user_id = user.id;

    return res.status(200).json({
        name: user.name,
        email: user.email,
    });
}

function logoff(req, res) {
    global.user_id = null;

    return res.status(200).end();
}

module.exports = { register, logon, logoff };
