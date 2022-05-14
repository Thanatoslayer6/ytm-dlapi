const ytdl = require('ytdl-core');
const contentDisposition = require('content-disposition')
const axios = require('axios').default;
const NodeID3 = require('node-id3')
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const router = express.Router();

router.get('/song/:videoId', async (req, res) => { // Year, Artist/, Title/, Album/, Art Cover URL/
    // Set headers
    res.setHeader('Content-disposition', contentDisposition(`${req.query.artist} - ${req.query.title}.mp3`));
    res.setHeader('Content-Type', 'audio/mpeg');
    //////////
    // First download album cover
    let albCover = await axios.get(req.query.cover, { responseType: 'arraybuffer' })
    let tags = {
        title: req.query.title,
        artist: req.query.artist,
        album: req.query.album,
        year: req.query.year,
        trackNumber: req.query.track,
        image: {
            imageBuffer: Buffer.from(albCover.data, 'utf-8')
        }
    }
    //// Grab the stream
    let stream = ytdl(req.params.videoId, {
        quality: 'highestaudio',
    })

    let song = [] // Array to store untagged song buffer to...
    ffmpeg(stream)
        .toFormat('mp3')
        .pipe()
        .on('data', chunk => {
            song.push(chunk)
        })
        .on('error', err => {
            console.error(`Stream failed to process => ${err}`)
        })
        .on('end', () => {
            NodeID3.write(tags, Buffer.concat(song), (err, taggedBuffer) => {
                if (err) {
                    console.error(`Failed to add tags to song => ${err}`)
                } else {
                    res.end(taggedBuffer)
                    console.log(`File '${req.query.artist} - ${req.query.title}.mp3' sent! to ${req.connection.remoteAddress}:${req.connection.remotePort}`)
                }
            })
        })
})

module.exports = router 
