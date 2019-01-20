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

// KEYFRAME FUNCTIONS
function isInside(n, a, b) {

	let greater = Math.max(a, b);
	let lesser = Math.min(a, b);

	return (n <= greater && n >= lesser);
}

function isCloseTo(a, b, delta) {
	return isInside(a, b-delta, b+delta);
}

const saveProject = (name, project) => {
    const { tracks } = project;
    
    // Classes
    const Group = time => ({
        time: time,
        keyframes: [],
    })
    const CrossTrackKeyframe = time => ({
        time: time,
        values: new Array(tracks.length),
    })
    
    if(!tracks || !name || !Array.isArray(tracks)) return;
    
    // Merge and sort
    const allKeyframes = tracks.map(t => t.keyframes).reduce((acc, v) => acc.concat(v), []);
    allKeyframes.sort((a, b) => a.time - b.time);
    
    // Group
    const grouped = [];
    let current = Group(0);
    
    for(let i = 0; i < allKeyframes.length; i++) {
		
		let k = allKeyframes[i];
		let t = current.time;
		
		// If this keyframe is the same time as the last keyframe
		if(isCloseTo(k.time, t, 0.01)) {
			current.keyframes.push(k);
		}
		// If it's a new time
		else {
			let newGroup = JSON.parse(JSON.stringify(current));
			grouped.push(newGroup);
			current = Group(k.time);
			current.keyframes.push(k);
		}
    }
    
    // Push last set of keyframes
    grouped.push(current);
    
    const finalKeyframes = [];
    
    for(let i = 0; i < grouped.length; i++) {
		let g = grouped[i];
		
		// Initialize new frame
		let newFrame = CrossTrackKeyframe(g.time);
		
		// Get previous keyframe
		let prevFrame = (i == 0) ? null : finalKeyframes[i - 1];
		
		// Fill values with known new values
		for(let k = 0; k < g.keyframes.length; k++) {
			let channel = g.keyframes[k].channel;
			newFrame.values[channel] = (g.keyframes[k].state) ? 1 : 0;
			//console.log("Set ", channel, " to ", newFrame.values[channel]);
		}
		
		// Fill empty values with previous frame's value
		for(let v = 0; v < newFrame.values.length; v++) {
			if(newFrame.values[v] == undefined) {
				
				if(prevFrame != null) {
					newFrame.values[v] = prevFrame.values[v];
				}
				else {
					newFrame.values[v] = 0;
				}
				
			}
		}
		
		finalKeyframes.push(newFrame);
    }
    
    const stringKeyframes = finalKeyframes
        .map(k => (
            k.time + ',' + k.values.join(',')
        ))
        .join('\n');
    
    fs.writeFileSync(showPath(name), stringKeyframes);
}

module.exports = {
    audioPath,
    showPath,
    projectPath,
    updateDatabaseFromFolders,
    deleteShowFiles,
    isPlayable,
    getPlayableShows,
    saveProject,
};