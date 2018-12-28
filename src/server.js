const data = require('./data');
const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');

const config = require('./config');
const api = require('./routes/api');

const models = require('./models');

const player = require('./player');
const timer = require('./timer');

timer.updateJobs();

const app = express();
app.use(express.json());
app.use('/api', api);
app.get('/', (req, res) => res.sendFile(path.resolve('www', 'index.html')));
app.use(express.static('www'));

const port = process.env.PORT || config.get().port || 1225;

const server = http.createServer(app);

const io = socketio(server);

io.on('connection', socket => {
    console.log('A user connected!');
    
    socket.emit('status_update', player.getStatus());
    
    const statusChanged = status => {
        socket.emit('status_update', status);
    }
    
    player.addStatusListener(statusChanged);
    
    socket.on('disconnect', () => {
        player.removeStatusListener(statusChanged);
    })
});

const main = async () => {
    
    try {
        await models.sequelize.sync({ force: false, alter: false });
        
        await data.updateDatabaseFromFolders();
        
        server.listen(port);
        console.log('Server listening on port', port);
    }
    catch(err) {
        console.error("Error syncing database:", err);
    }
    
}

main();
