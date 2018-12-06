const path = require('path');
const express = require('express');
const models = require('../models');
const validation = require('../validation');

const router = express.Router();

router.get('/', async (req, res) => {
    const allShows = await models.Show.findAll();
    
    res.json(allShows);
});

router.post('/', validation.createShow, async (req, res) => {
    
    const displayName = req.body.name;
    const name = displayName.trim().replace(/\s+/g, '_').toLowerCase();
    
    const show = await models.Show.create({ name, displayName });
    
    res.json({ show });
})

router.get('/:show/audio', async (req, res) => {
    
    res.sendFile(path.resolve('data', 'audio', `${req.params.show}.mp3`));
});

router.get('/:show/project', async (req, res) => {
    
    
})

module.exports = router;