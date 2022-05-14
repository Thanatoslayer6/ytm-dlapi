const YTMusic = require("ytmusic-api").default
const ytmusic = new YTMusic();
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/album/:albumId', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.getAlbum(req.params.albumId).then(info => {
            res.status(200).send(info);
        }).catch(err => {
            res.status(404).send(`Invalid albumId! = '${req.params.albumId}' Not Found!`)
        })
    }).catch(err => {
        res.status(500).send(`Failed to initialize ytmusic: ${err}`)
    })
})

router.get('/album/playlist/:playlistId', (req, res) => {
    let properUrl = `https://m.youtube.com/playlist?list=${req.params.playlistId}`
    axios.get(properUrl)
        .then(resp => {
            // Scrape json inside script tag
            let ytInitialData = JSON.parse(/(?:window\["ytInitialData"\])|(?:ytInitialData) =.*?({.*?});/s.exec(resp.data)?.[1] || '{}');
            let listData = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
            let info = listData.contents
            res.status(200).send(info);
        }).catch(err => {
            res.status(404).send(`Invalid playlistId! = '${req.params.playlistId}' Not Found!`)
        })
})

router.get('/song/:videoId', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.getSong(req.params.videoId).then(info => {
            res.status(200).send(info);
        }).catch(err => {
            res.status(404).send(`Invalid videoId! = '${req.params.videoId}' Not Found!`)
        })
    }).catch(err => {
        res.status(500).send(`Failed to initialize ytmusic: ${err}`)
    })
})

module.exports = router 
