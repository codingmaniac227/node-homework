module.exports = (req, res, next) => {
    if (!global.user_id) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    const user = global.users.find(user => user.id === global.user_id)

    if (!user) {
        return res.status(401).send({
            message: 'Unauthorized'
        })
    }

    req.user = user
    next()
}