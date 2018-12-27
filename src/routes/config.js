const express = require('express');
const config = require('../config');
const timer = require('../timer');

const router = express.Router();

router.get('/', (req, res) => {
    res.json(config.get());
});

router.put('/', (req, res) => {
    const newConfig = req.body;
    
    config.save(newConfig);
    timer.updateJobs();
    
    res.end();
})

module.exports = router;