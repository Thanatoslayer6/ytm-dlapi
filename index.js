const express = require('express');
const app = express();
const search = require('./api/search.js')
const get = require('./api/get.js')
const stream = require('./api/stream.js')
const download = require('./api/download.js')

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/example-frontend/index.html`) // Edit this to your preferred client html page
})

// Routes
app.use('/api/search', search);
app.use('/api/get', get);
app.use('/api/stream', stream);
app.use('/api/download', download);
app.use(express.static(`${__dirname}/example-frontend`))

app.listen(4000, () => {
    console.log('App working on port 4000')
})

