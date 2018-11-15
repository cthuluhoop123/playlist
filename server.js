require('dotenv').config()

const request = require('superagent')
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

const activeVideosLength = {}

app.get('/info/:videoID', async (req, res) => {
    try {
        const info = await ytdl.getInfo(req.params.videoID, { filter: 'audioonly' })
        res.json({
            title: info.title,
            media: info.media,
            author: info.author,
            length_seconds: info.length_seconds,
            videoID: req.params.videoID,
            thumbnail_url: info.thumbnail_url
        })
    } catch (e) {
        res.sendStatus(500)
    }
})

app.get('/listen/:videoID', async (req, res) => {

    try {
        const info = await ytdl.getInfo(req.params.videoID)
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' })
        const response = await request.head(format.url)
        activeVideosLength[req.params.videoID] = {
            length: parseInt(response.headers['content-length'])
        }
    } catch (e) {
        res.sendStatus(500)
        return
    }

    try {
        if (req.headers.range) {
            const parts = req.headers.range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : activeVideosLength[req.params.videoID].length - 1
            res.status(206)
            res.set({
                'Content-Type': 'audio/*',
                'Content-Length': (end - start) + 1,
                'Accept-Ranges': 'bytes',
                'Content-Range': `bytes ${start}-${end}/${activeVideosLength[req.params.videoID].length}`
            })
            const musicStream = ytdl(req.params.videoID, { filter: 'audioonly', range: { start, end } })
            musicStream.on('error', err => { })
            musicStream.pipe(res)
        } else {
            const musicStream = ytdl(req.params.videoID, { filter: 'audioonly' })
            res.status(200)
            res.set('Content-Type', 'audio/*')
            musicStream.pipe(res)
        }

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