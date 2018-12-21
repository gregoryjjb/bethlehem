const express = require('express');
const shows = require('./shows');
const play = require('./play');
const config = require('./config');

const api = express.Router();

api.use('/shows', shows);
api.use('/play', play);
api.use('/config', config);

api.get('/', (req, res) => {
    res.send("This is the API");
})

module.exports = api;