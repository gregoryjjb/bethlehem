const childProcess = require('child_process');
const path = require('path');
const data = require('./data');
const config = require('./config');
const { clamp } = require('./utils');

function mySpawn() {
    console.log('spawn called');
    console.log(arguments);
    var result = childProcess.spawn.apply(this, arguments);
    return result;
}

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
}

const killPlaylist = () => {
    playlist = null;
    playlistPointer = null;
}

const killTimeout = () => {
    clearTimeout(timeout);
    timeout = null;
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
    
    if(next !== null) {
        const interShowTime = Math.max(config.get().interShowDelay * 1000, 1);
        timeout = setTimeout(() => playNext(), interShowTime);
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

const playAll = () => {
    killAll();
    
    playlist = data.getPlayableShows();
    if(playlist.length === 0) return;
    
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
    play,
    playAll,
    stop,
    next,
};