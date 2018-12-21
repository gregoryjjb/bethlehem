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
    
    const shows = fs.readdirSync(showDir);
    const projects = fs.readdirSync(projectDir);
    const audios = fs.readdirSync(audioDir);
    
    const showNames = shows
        .filter(f => path.extname(f) === '.txt')
        .map(f => f.replace(/\.[^.]*$/g, ''))
    
    const projectNames = projects
        .filter(f => path.extname(f) === '.json')
        .map(f => f.replace(/\.[^.]*$/g, ''))
    
    const names = [...showNames, ...projectNames];
    
    //console.log('Show names:', showNames);
    //console.log('Project names:', projectNames);
    //console.log('Names:', names);
    
    for(let name of names) {
        console.log('  ' + name);
        
        try {
            const existingShow = await models.Show.findOne({ where: { name } });
            
            let hasAudio = audios.includes(name + '.mp3');
            let hasSource = projectNames.includes(name);
            
            if(existingShow) {
                console.log(`    Exists in DB; audio: ${hasAudio}, source: ${hasSource}`);
                
                await existingShow.update({
                    hasAudio,
                    hasSource,
                });
            }
            else {
                console.log(`    Does not exist in DB, creating; audio: ${hasAudio}, source: ${hasSource}`);
                
                await models.Show.create({
                    name,
                    displayName: name,
                    hasAudio,
                    hasSource,
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

const getPlayableShows = () => {
    const showFiles = fs.readdirSync(showDir);
    
    return showFiles.map(f => f.replace(/\.[^.]*$/g, '')).filter(n => isPlayable(n));
}

module.exports = {
    audioPath,
    showPath,
    projectPath,
    updateDatabaseFromFolders,
    deleteShowFiles,
    isPlayable,
    getPlayableShows,
};