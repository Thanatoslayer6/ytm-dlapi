const YTMusic = require("ytmusic-api").default
const ytmusic = new YTMusic();
const express = require('express');
const router = express.Router();

router.get('/album/:query', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.searchAlbums(req.params.query).then(info => {
            res.send(info);
        })
    })
})

router.get('/song/:query', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.searchSongs(req.params.query).then(info => {
            res.send(info);
        })
    })
})

module.exports = router
