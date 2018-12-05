const data = require('./data');

const http = require('http');
const config = require('./config');
const { sleep } = require('./utils');
const playerProc = require('./player-proc');

const port = process.env.PORT || config.get().port || 1225;

const server = http.createServer();

server.listen(port);