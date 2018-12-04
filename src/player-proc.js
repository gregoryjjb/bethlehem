const path = require('path');
const childProcess = require('child_process');

const file = path.resolve('src/player.js');
const params = [];
const options = {
    stdio: [null, null, null, 'ipc']
}

const playerProc = childProcess.fork(file, params, options);

playerProc.stdout.pipe(process.stdout);
playerProc.stderr.pipe(process.stderr);

module.exports = playerProc;