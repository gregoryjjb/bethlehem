const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

console.log("Starting player process");

// Flags
let PLAY = false;
let STOP = false;
let SKIP = false;

let showTimer = null;

process.on('message', message => {
    console.log("Got a message that said", message);
    if(message === 'PLAY') playShow('we_wish_you_a_merry_christmas');
    if(message === 'STOP') stopAll();
})

const loadShow = (filename) => {
    let filepath = path.resolve('data', filename);
    let contents = fs.readFileSync(filepath);
    let lines = contents.toString().split('\n');
    return lines;
}

const playShow = async (showName) => {
    const showLines = loadShow(showName + '.txt').map(s => s.split(','));
    
    let i = 0;
    const start = Date.now();
    
    clearInterval(showTimer);
    showTimer = setInterval(() => {
        // Check if show is over
        if(i >= showLines.length) {
            clearInterval(showTimer);
            return;
        }
        
        const currentSeconds = (Date.now() - start) / 1000;
        const nextLineSeconds = showLines[i][0];
        
        if(currentSeconds >= nextLineSeconds) {
            // Play note on GPIO
            // (or console)
            console.log(showLines[i].slice(1).map(s => {
                return (s == '0' ? ' ' : 'X');
            }).join(' '));
            i++;
        }
    }, 2);
}

const playList = (listName) => {
    
}

const stopAll = () => {
    clearInterval(showTimer);
}

async function main() {
    playShow('we_wish_you_a_merry_christmas');
    //playShow('wizards_in_winter_2');
    
}

main();