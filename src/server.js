const http = require('http');

const path = require('path');
const childProcess = require('child_process');
const config = require('./config');

const child = childProcess.fork(path.resolve('child.js'));



const port = process.env.PORT || 1225;

const server = http.createServer();

//server.listen(port);