const YTMusic = require("ytmusic-api").default
const ytmusic = new YTMusic();
const express = require('express');
const router = express.Router();
const { parse } = require('himalaya')
const axios = require('axios').default;

router.get('/album/:albumId', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.getAlbum(req.params.albumId).then(info => {
            res.send(info);
        }).catch(err => {
            res.send("Invalid albumId for ALBUM")
        })
    })
})

router.get('/album/playlist/:playlistId', async(req, res) => {
    // Get the Track ID for every track by scraping from an unlisted Youtube playlist
    let properUrl = `https://m.youtube.com/playlist?list=${req.params.playlistId}`
    let resp = await axios.get(properUrl);

    // Scrape json inside script tag
    let yt = parse(resp.data)[1].children[1].children[16].children[0].content // 16th element inside body
    let ytdata = JSON.parse(yt.slice(20, yt.length - 1)) // Parse json
    let info = ytdata.contents.twoColumnBrowseResultsRenderer.tabs[0]
                .tabRenderer.content.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents[0]
                .playlistVideoListRenderer.contents
    res.send(info)
})

router.get('/song/:videoId', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.getSong(req.params.videoId).then(info => {
            res.send(info);
        }).catch(err => {
            res.send("Invalid videoId for SONG");
        })
    })
})

module.exports = router 
