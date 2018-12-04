const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

console.log("Starting player process");

// Flags
let PLAY = false;
let STOP = false;
let SKIP = false;

let status = "stopped";

process.on('message', message => {
    console.log("Got a message that said", message);
    if(message === 'PLAY') PLAY = true;
    if(message === 'STOP') STOP = true;
})

const loadShow = (filename) => {
    let filepath = path.resolve('data', filename);
    let contents = fs.readFileSync(filepath);
    let lines = contents.toString().split('\n');
    return lines;
}

const playShow = (showName) => {
    
}

async function main() {
    
    const showLines = loadShow('wizards_in_winter_2.txt').map(s => s.split(','));
    
    let i = 0;
    
    const start = Date.now();
    
    //while(i < showLines.length) {
    //    if(STOP) break;
        
        let func = setInterval(() => {
            if(STOP) {
                clearInterval(func);
                return;
            }
            
            const currentSeconds = (Date.now() - start) / 1000;
            const nextLineSeconds = showLines[i][0];
            
            if(currentSeconds >= nextLineSeconds) {
                console.log(showLines[i].slice(1).map(s => {
                    return (s == '0' ? ' ' : 'X');
                }).join(' '));
                i++;
            }
        }, 2);
        
    //}
    
    /*while(true) {
        if(PLAY) {
            status = "playing";
        }
        if(STOP) {
            STOP = false;
            PLAY = false;
            status = "stopped"
        }
        
        console.log(status);
        await sleep(500);
    }*/
}

main();