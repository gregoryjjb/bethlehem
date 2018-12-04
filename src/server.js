const http = require('http');
const config = require('./config');
const { sleep } = require('./utils');
const playerProc = require('./player-proc');

const port = process.env.PORT || 1225;

const server = http.createServer();

async function main() {
    //while(true) {
        //console.log('starting server loop');
        //await sleep(750 + Math.random() * 1000);
        await sleep(2000);
    //    playerProc.send('PLAY');
    //    await sleep(750 + Math.random() * 1000);
    console.log("Sending stop");
        playerProc.send('STOP');
    //}
}

main();

//server.listen(port);