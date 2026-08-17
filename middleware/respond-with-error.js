function respondWithError(res, err, next) {
    if (err.statusCode) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    return next(err);
}

module.exports = respondWithError;
