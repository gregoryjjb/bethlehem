const express = require('express');
const player = require('../player');

const play = express.Router();

play.get('/', (req, res) => {
    res.send(
        `Playback controls for shows<br>
        Available commands:<br>
        /all<br>
        /single/:name<br>
        /skip<br>
        /stop<br>`
    );
});

play.get('/all', (req, res) => {
    
    player.playAll();
    
    res.send('Should be playing all...');
});

play.get('/single/:name', (req, res) => {
    const { name } = req.params;
    
    if(!name) {
        return res.status(400).send('include a name to play');
    }
    
    player.play(name);
    
    res.send('Should be playing ' + name);
});

play.get('/skip', (req, res) => {
    player.next();
    
    res.send('Should have gone to next...');
});

play.get('/stop', (req, res) => {
    player.stop();
    
    res.send('Should have stopped...');
});

module.exports = play;