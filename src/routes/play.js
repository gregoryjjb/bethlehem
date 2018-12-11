const express = require('express');
const player = require('../player');

const router = express.Router();

router.get('/', (req, res) => {
    
    player.playAll();
    
    res.send('Should be playing all...');
});

router.get('/play/:name', (req, res) => {
    
    player.play(name);
    
    res.send('Should be playing', req.params.name);
});

router.get('/next', (req, res) => {
    player.next();
    
    res.send('Should have gone to next...');
})

router.get('/stop', (req, res) => {
    player.stop();
    
    res.send('Should have stopped...');
});

module.exports = router;