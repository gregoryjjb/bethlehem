const path = require('path');
const fs = require('fs');
const express = require('express');
const fileUpload = require('express-fileupload');
const models = require('../models');
const validation = require('../validation');
const data = require('../data');

const router = express.Router();

router.get('/', async (req, res) => {
    const allShows = await models.Show.findAll();
    res.json(allShows);
});

router.post('/', validation.createShow, async (req, res) => {
    // Generate safe name from display name
    const displayName = req.body.name;
    const name = displayName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-z0-9_]+/g, ''); // Remove non alphanumeric characters
    
    // Safe name may have completely erased name
    if(name.length === 0) {
        return res.status(400).json({ error: 'unable to generate name from display name' });
    }
    
    try {
        // Check for existing shows of that name
        const existingShow = await models.Show.findOne({ where: {
            [models.Sequelize.Op.or]: [{ name }, { displayName }],
        }});
        
        if(existingShow) {
            return res.status(400).json({ error: `show of name '${name}' already exists` });
        }
        
        // Create project json
        fs.writeFileSync(path.resolve('data', 'projects', name + '.json'), '{}');
        
        // Create and return show
        const show = await models.Show.create({ name, displayName, hasAudio: false });
        res.json({ show });
    }
    catch(err) {
        res.status(500).json({ error: err });
    }
});

// Parse show object out of request
router.param('show', async (req, res, next, name) => {
    try {
        const show = await models.Show.findOne({ where: { name }});
        
        if(show) {
            req.show = show;
            next();
        }
        else {
            return res.status(404).json({ error: `show of name '${name}' not found` });
        }
    }
    catch(err) {
        return res.status(500).json({ error: err.message });
    }
})

router.route('/:show')
    .get(async (req, res) => {
        return res.json(req.show);
    })
    
    .delete(async (req, res) => {
        const name = req.show.name;
        data.deleteShowFiles(name);
        
        req.show.destroy();
        
        return res.status(204).end();
    })
    
router.route('/:show/audio')
    .get((req, res) => {
        const filename = path.resolve('data', 'audio', `${req.show.name}.mp3`)
        
        if(fs.existsSync(filename)) {
            res.sendFile(path.resolve('data', 'audio', `${req.show.name}.mp3`));
        }
        else {
            res.status(404).json({ error: 'show does not have associated audio' });
        }
    })
    
    .post(fileUpload(), (req, res) => {
        // Make sure a file was sent
        if(!req.files || Object.keys(req.files).length == 0) {
            return res.status(400).json({ error: 'no audio files sent' });
        }
        
        const file = req.files[Object.keys(req.files)[0]];
        
        // Make sure the file is MP3
        if(path.extname(file.name) !== '.mp3') {
            return res.status(400).json({ error: 'only files of type .mp3 accepted' });
        }
        
        // Save the file
        const filename = req.show.name + '.mp3';
        file.mv(path.resolve('data', 'audio', filename), err => {
            if(err) {
                res.status(500).json({ error: err });
            }
            else {
                req.show.update({ hasAudio: true });
                
                res.status(201).end();
            }
        });
    })

router.route('/:show/project')
    .get((req, res) => {
        const filename = path.resolve('data', 'projects', req.show.name + '.json');
        
        if(fs.existsSync(filename)) {
            const project = require(filename);
            return res.json({ project });
        }
        else {
            return res.status(404).json({ error: 'no project exists for show' });
        }
    })

module.exports = router;