function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        message:
            statusCode >= 500
                ? 'Internal Server Error'
                : `${statusCode} ${err.name}: ${err.message}`,
    })
}

module.exports = errorHandler