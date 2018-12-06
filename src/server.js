const data = require('./data');
const http = require('http');
const config = require('./config');
const express = require('express');
const api = require('./routes/api');

const models = require('./models');

const app = express();
app.use(express.json());
app.use('/api', api);
app.get('/', (req, res) => res.send("What"))

const port = process.env.PORT || config.get().port || 1225;

const server = http.createServer(app);

models.sequelize
    .sync({ force: false })
    .then(() => {
        server.listen(port);
        console.log("Server listening on", port);
    })
    .catch(err => {
        console.error("Error syncing database:", err.message);
    })
