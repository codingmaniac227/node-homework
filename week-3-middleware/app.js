const express = require("express");
const dogsRouter = require("./routes/dogs");

const { randomUUID } = require('crypto')
const {join} = require("node:path");

const app = express();

app.use(express.static(join(__dirname, "public")))

// Assignment 3b and 3c ask you to add middleware in this file.
function reqID(req, res, next) {
  req.requestId = randomUUID()
  res.setHeader('X-Request-Id', req.requestId)
  next()
}

function log(req, res, next) {
  console.log(`[${Date.now()}]: ${req.method} ${req.path} (${req.requestId})`)
  next()
}

function notFound(req, res) {
  res.status(404).json({
    error: 'Route not found',
    requestId: req.requestId
  })
}

function setHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  })
  next()
}

function postReqContentTypeCheck(req, res, next) {
  if (
      !req.is('application/json') &&
      req.method === 'POST'
  ) {
    return res.status(400).json({
      error: 'Content-Type must be application/json',
      requestId: req.requestId
    })
  }
  next()
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  if (statusCode >= 400 && statusCode < 500 ) {
    console.warn(`WARN: ${err.name} - ${err.message}`)
  } else if (statusCode >= 500) {
    console.error(`ERROR: ${err.name} - ${err.message}`)
  }

  return res.status(statusCode).json({
    error:
        statusCode >= 500
        ? 'Internal Server Error'
        : err.message,
    requestId: req.requestId
  })
}


app.use(express.json({ limit: '1mb' }))
app.use(reqID)
app.use(log)
app.use(setHeaders)
app.use(postReqContentTypeCheck)



app.use("/", dogsRouter);// Do not remove this line

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Dog rescue app is listening on port 3000...");
  });
}

module.exports = app;

