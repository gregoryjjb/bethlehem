const childProcess = require('child_process');
const path = require('path');
const models = require('./models');
const data = require('./data');
const config = require('./config');
const { clamp } = require('./utils');

////////////////////////////////
// Status Handling

let status = 'off';

const statusListeners = [];

const getStatus = () => status;

const statusChanged = () => {
    for(let f of statusListeners) {
        if(typeof f === 'function') {
            f(status);
        }
    }
}

const setStatus = {
    on: () => { status = 'on'; statusChanged(); },
    off: () => { status = 'off'; statusChanged(); },
    upNext: show => { status = `next:${show}`; statusChanged(); },
    playing: show => { status = `playing: ${show}`; statusChanged(); },
}

const addStatusListener = func => {
    if(typeof func !== 'function') return;
    
    statusListeners.push(func);
}

const removeStatusListener = func => {
    const index = statusListeners.indexOf(func);
    
    if(index >= 0) {
        statusListeners.splice(index, 1);
    }
}

////////////////////////////////
// Process Handling

let playerProc = null;
let timeout = null;

let playlist = null;
let playlistPointer = null;

const getNextShow = () => {
    if(!playlist || !Array.isArray(playlist)) return null;
    
    let newPointer = playlistPointer + 1;
    if(newPointer >= playlist.length) newPointer = 0;
    return playlist[newPointer];
}

const incrementPointer = () => {
    if(playlistPointer === null) return;
    playlistPointer += 1;
    if(playlistPointer >= playlist.length) playlistPointer = 0;
}

const killShow = () => {
    if(playerProc) {
        playerProc.kill('SIGTERM');
        console.log('PYTHON KILLED');
    }
    
    setStatus.on();
}

const killPlaylist = () => {
    playlist = null;
    playlistPointer = null;
}

const killTimeout = () => {
    clearTimeout(timeout);
    timeout = null;
    
    setStatus.on();
}

const killAll = () => {
    killPlaylist();
    killTimeout();
    killShow();
}

const playShow = name => {
    timeout = null;
    
    if(!name) {
        console.error('Empty name passed to playShow');
        return;
    }
    
    if(data.isPlayable(name)) {
        const cmd = 'python';
        const args = [
            'playshow.py',
            data.audioPath(name),
            data.showPath(name),
        ];
        
        const dir = path.resolve('pyplayer');
        try {
            console.log('SPAWNING PYTHON');
            playerProc = childProcess.spawn(cmd, args, { cwd: dir, stdio: 'inherit' });
            playerProc.on('close', showEnded);
            
            setStatus.playing(name);
            
            //models.Show.findOne({ where: { name } })
            //    .then(show => {
            //        setStatus.playing(show.displayName);
            //    })
            //    .catch(err => {
            //        setStatus.playing(name);
            //    })
        }
        catch(err) {
            console.error('Major bo-bo trying to play', err);
        }
    }
    else {
        // Advance to next song immediately
        immediate = true;
        showEnded(null, null);
    }
}

const showEnded = (code, signal) => {
    console.log(`Python process ended, code: ${code}, signal: ${signal}`);
    
    if(code === 0) {
        // Exited normally
        console.log(`Python process exited normally, setting timeout for next song`);
        setNextTimeout();
    }
    else {
        // Was force stopped
        console.log(`Python process was force stopped, doing nothing`);
    }
}

const setNextTimeout = () => {
    killTimeout(); // Just in case
    const next = getNextShow();
    
    if(next !== null) {
        const interShowTime = Math.max(config.get().interShowDelay * 1000, 1);
        timeout = setTimeout(() => playNext(), interShowTime);
        setStatus.upNext(next);
    }
}

const playNext = () => {
    killShow();
    killTimeout();
    
    const next = getNextShow();
    
    if(next) {
        incrementPointer();
        playShow(next);
    }
}

////////////////////////////////
// "User-Facing" Controls

const playAll = async () => {
    killAll();
    
    playlist = data.getPlayableShows();
    
    // Only play shows that have 'playInAll' set to true
    const enabledShows = await models.Show.findAll({ where: { playInAll: true } });
    playlist = playlist.filter(name => enabledShows.find(show => show.name === name));
    
    if(playlist.length === 0) {
        console.log('Attempted to play all but no playable shows found');
        return;
    };
    
    playlistPointer = 0;
    
    playShow(playlist[0]);
}

const play = (name) => {
    killAll();
    playShow(name);
}

const stop = () => {
    killAll();
}

const next = () => {
    //immediate = true;
    //killShow();
    playNext();
}

module.exports = {
    addStatusListener,
    removeStatusListener,
    play,
    playAll,
    stop,
    next,
    getStatus,
};