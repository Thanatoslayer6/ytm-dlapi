const YTMusic = require("ytmusic-api").default
const ytmusic = new YTMusic();
const express = require('express');
const router = express.Router();

router.get('/album/:albumId', (req, res) => {
    ytmusic.initialize().then(() => {
        ytmusic.getAlbum(req.params.albumId).then(info => {
            res.send(info);
        }).catch(err => {
            res.send("Invalid albumId for ALBUM")
        })
    })
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
