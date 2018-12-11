const fs = require('fs');
const path = require('path');

const models = require('./models');

const dataDir = path.resolve('data');
const audioDir = path.resolve('data', 'audio');
const projectDir = path.resolve('data', 'projects');
const showDir = path.resolve('data', 'shows');

const audioPath = name => path.resolve(audioDir, name + '.mp3');
const projectPath = name => path.resolve(projectDir, name + '.json');
const showPath = name => path.resolve(showDir, name + '.txt');

// Create folders if they don't exist
[dataDir, audioDir, projectDir, showDir].forEach(dir => {
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const updateDatabaseFromFolders = async () => {
    
    console.log('Updating database from folders');
    
    const projects = fs.readdirSync(projectDir);
    const audios = fs.readdirSync(audioDir);
    
    for(let filename of projects) {
        
        const name = filename.replace(/\.[^.]*$/g, '');
        const ext = path.extname(filename);
        
        console.log('  Checking', name);
        
        if(ext !== '.json') return;
        
        try {
            const existingShow = await models.Show.findOne({ where: { name } });
            
            if(existingShow && existingShow.hasAudio) {
                console.log('    Show already exists with audio');
            }
            else if(existingShow && !existingShow.hasAudio) {
                let hasAudio = audios.includes(name + '.mp3');
                
                if(hasAudio) {
                    console.log('    Updating with newfound audio');
                    await existingShow.update({ hasAudio: true });
                }
                else {
                    console.log('    Show exists, no new audio found');
                }
            }
            else {
                console.log('    Show does not exist in database, creating');
                
                let hasAudio = audios.includes(name + '.mp3');
                
                await models.Show.create({
                    name,
                    displayName: name,
                    hasAudio,
                });
            }
        }
        catch(err) {
            console.error('Error updating DB from folders:', err.message);
        }
    }    
}

const deleteIfExists = (file) => {
    if(fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}

const deleteShowFiles = (name) => {
    const audio = path.resolve(audioDir, name + '.mp3');
    const project = path.resolve(projectDir, name + '.json');
    const show = path.resolve(showDir, name + '.txt');
    
    [audio, project, show].forEach(deleteIfExists);
}

const isPlayable = name => {
    if(!name) return;
    
    return fs.existsSync(audioPath(name)) && fs.existsSync(showPath(name));
}

module.exports = {
    audioPath,
    showPath,
    projectPath,
    updateDatabaseFromFolders,
    deleteShowFiles,
    isPlayable,
};