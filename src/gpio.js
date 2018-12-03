const config = require('./config');

const c = config.get();

const ON = c.invertPinOutput ? false : true;
const OFF = !ON;