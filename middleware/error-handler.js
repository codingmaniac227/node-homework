function errorHandler(err, req, res, next) {
    if (err.code === "ECONNREFUSED" && err.port === 5432) { // the postgresql port
        console.log("The database connection was refused.  Is your database service running?");
    }

    const statusCode = err.statusCode || 500
    return res.status(statusCode).json({
        message:
            statusCode >= 500
                ? 'Internal Server Error'
                : `${statusCode} ${err.name}: ${err.message}`,
    })
}

module.exports = errorHandler
