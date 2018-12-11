const childProcess = require('child_process');
const data = require('../data');

let playerProc = null;

let playlist = null;
let playlistPointer = null;

const getNextShow = () => {
    if(!playlist || !Array.isArray(playlist)) return null;
    
    playlistPoint += 1;
    
    if(playlistPointer >= playlist.length) playlistPointer = 0;
    
    return playlist[playlistPointer];
}

const killShow = () => {
    
    if(playerProc) {
        playerProc.kill('SIGTERM');
    }
    
}

const playShow = name => {
    killShow();
    
    if(!name) {
        console.error('Empty name passed to playShow');
        return;
    }
    
    if(data.isPlayable(name)) {
        const cmd = [
            'python',
            'playshow.py',
            data.audioPath(name),
            data.showPath(name),
        ].join(' ');
        
        const dir = path.resolve('src', 'player');
        playerProc = childProcess.spawn(cmd, { cwd: dir });
        playerProc.on('close', showEnded);    
    }
    else {
        showEnded(null, null);
    }
}

const showEnded = (code, signal) => {
    
    const next = getNextShow();
    
    if(next !== null) {
        playShow(next);
    }
}