
function register(req, res) {
    const { name, email, password } = req.body;
    let user = { name, email, password };
    global.users.push(user)
    global.user_id = user

    res.status(201).json({
        name: name,
        email: email
    })
}

function logon(req, res) {
    const { email, password } = req.body;

    const user = global.users.find(
        (user) =>
            user.email === email &&
            user.password === password
    )

    global.user_id = user

    if (!user) {
        return res.status(401)
    }


    res.status(200).json({
        name: user.name,
        email: user.email
    })
}

function logoff(req, res) {
    global.user_id = null

    res.status(200).end()
}

module.exports = {register, logon, logoff}