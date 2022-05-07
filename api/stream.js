const express = require('express')
const router = express.Router()
const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');

router.get('/song/:videoId', (req, res) => {
    res.setHeader('Content-type', 'audio/mpeg')
    let stream = ytdl(req.params.videoId, {
        quality: 'highestaudio',
    })
    let proc = ffmpeg({source: stream})
        .toFormat('mp3')
    let songStream = proc.pipe()
    songStream.pipe(res) // Stream to client
})

module.exports = router
