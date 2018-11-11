const express = require('express')
const app = express()

const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cors())
app.use(helmet())

app.disable('x-powered-by')
app.disable('etag')