require('dotenv').config()

const fs = require('fs')

const ytdl = require('ytdl-core')

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

app.get('/listen/:videoID', async (req, res) => {
    try {

        let musicStream = ytdl(req.params.videoID, { filter: 'audioonly' })
        res.status(200)
        res.set('Content-Type', 'audio/ogg')
        musicStream.pipe(res)

    } catch (e) {
        res.json({
            error: 'An error has occured...'
        })
    }
})

app.get('*', (req, res) => res.sendStatus(404))
app.post('*', (req, res) => res.sendStatus(404))

app.listen(process.env.PORT, () => {
    console.log(`Running on port ${process.env.PORT}`)
})