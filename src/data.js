const fs = require('fs');
const path = require('path');

const dataDir = path.resolve('data');
const audioDir = path.resolve('data', 'audio');
const projectDir = path.resolve('data', 'projects');
const showDir = path.resolve('data', 'shows');

// Create folders if they don't exist
[dataDir, audioDir, projectDir, showDir].forEach(dir => {
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
});