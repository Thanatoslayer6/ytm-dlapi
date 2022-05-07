const ytdl = require('ytdl-core');
const contentDisposition = require('content-disposition')
const AdmZip = require('adm-zip')
const axios = require('axios').default;
const NodeID3 = require('node-id3')
const { PassThrough } = require('stream');
const { parse } = require('himalaya')
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const router = express.Router();

const ytdlStreamToBuffer = (stream) => {
    return new Promise((resolve, reject) => {
        let songStream = new PassThrough()
        let songBuffer = []
        ffmpeg(stream)
            .toFormat('mp3')
            .on('end', () => {
                resolve(Buffer.concat(songBuffer))
            })
            .on('error', err => {
                console.error(`ffstream failed => ${err}`)
                reject(false)
            })
            .writeToStream(songStream)

        songStream.on('data', chunk => {
            songBuffer.push(chunk)
        })
    })
}

const get_album_playlist = async (playlistId) => {
    // Get the Track ID for every track by scraping from an unlisted Youtube playlist
    let properUrl = `https://m.youtube.com/playlist?list=${playlistId}`
    let resp = await axios.get(properUrl);

    // Scrape json inside script tag
    let yt = parse(resp.data)[1].children[1].children[16].children[0].content // 16th element inside body
    let ytdata = JSON.parse(yt.slice(20, yt.length - 1)) // Parse json
    return ytdata.contents.twoColumnBrowseResultsRenderer.tabs[0]
                .tabRenderer.content.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents[0]
                .playlistVideoListRenderer.contents
}

router.get('/album/:playlistId', async (req, res) => {
    // Set header
    res.setHeader('Content-disposition', contentDisposition(`${req.query.artist} - ${req.query.album} (${req.query.year}).zip`));
    res.setHeader('Content-type', 'application/zip')
    // Get tags
    let albCover = await axios.get(req.query.cover, { responseType: 'arraybuffer' })
    let tags = {
        artist: req.query.artist,
        album: req.query.album,
        year: req.query.year,
        image: {
            imageBuffer: Buffer.from(albCover.data, 'utf-8')
        }
    }
    let tracks = await get_album_playlist(req.params.playlistId) // Scrape unlisted playlist...
    let songBuffers = [], stream, dlt;

    for await (let [i, el] of tracks.entries()) {
        stream = ytdl(el.playlistVideoRenderer.videoId, {
            quality: 'highestaudio'
        })
        dlt = await ytdlStreamToBuffer(stream)
        if (dlt == false) {
            console.log(`Error! loop : #${i}`) 
        } else {
            tags.title = el.playlistVideoRenderer.title.runs[0].text
            tags.trackNumber = i + 1;
            NodeID3.write(tags, dlt, (err, taggedBuffer) => { // Add tags to buffer
                if (err) {
                    console.error(`Failed to add tags to song => ${err}`)
                } else { // Push the tagged buffer to array
                    songBuffers.push(taggedBuffer)
                }
            })
        }
    }
    let zip = new AdmZip()
    let folderName = `${tags.artist} - ${tags.album} (${tags.year})/`;
    zip.addFile(folderName, null) // Add directory
    for (let [i, el] of tracks.entries()) { // Add every file as mp3
        zip.addFile(`${folderName}${tags.artist} - ${el.playlistVideoRenderer.title.runs[0].text}.mp3`, songBuffers[i])
    }
    let zippedBuffer = zip.toBuffer()
    res.end(zippedBuffer) // Send zip file to client
    console.log(`File '${req.query.artist} - ${req.query.album} (${req.query.year}).zip' sent! to ${req.connection.remoteAddress}:${req.connection.remotePort}`)
})

router.get('/song/:videoId', async (req, res) => { // Year, Artist/, Title/, Album/, Art Cover URL/
    // Set headers
    res.setHeader('Content-disposition', contentDisposition(`${req.query.artist} - ${req.query.title}.mp3`));
    res.setHeader('Content-type', 'audio/mpeg')
    ////////
    // First download album cover
    let albCover = await axios.get(req.query.cover, { responseType: 'arraybuffer' })
    let tags = {
        title: req.query.title,
        artist: req.query.artist,
        album: req.query.album,
        image: {
            imageBuffer: Buffer.from(albCover.data, 'utf-8')
        }
    }
    // Grab the stream
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
                    res.end(taggedBuffer) // Send file to client
                    console.log(`File '${req.query.artist} - ${req.query.title}.mp3' sent! to ${req.connection.remoteAddress}:${req.connection.remotePort}`)
                }
            })
        })
})

module.exports = router 
