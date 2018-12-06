const express = require('express');
const shows = require('./shows');

const api = express.Router();

api.use('/shows', shows);

api.get('/', (req, res) => {
    res.send("This is the API");
})

module.exports = api;