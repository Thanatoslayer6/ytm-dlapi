const YTMusic = require("ytmusic-api").default
const ytmusic = new YTMusic();
const express = require('express');
const router = express.Router();

router.get('/album/search', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.searchAlbums(req.query.q).then(info => { // 'api/album/search?q={QUERY}'
            res.status(200).send(info);
        }).catch(err => {
            res.status(403).send(err)
        })
    }).catch(err => {
        res.status(500).send(`Failed to initialize ytmusic: ${err}`)
    })
})

router.get('/song/search', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.searchSongs(req.query.q).then(info => { // 'api/song/search?q={QUERY}'
            res.status(200).send(info);
        }).catch(err => {
            res.status(403).send(err)
        })
    }).catch(err => {
        res.status(500).send(`Failed to initialize ytmusic: ${err}`)
    })
})

module.exports = router
