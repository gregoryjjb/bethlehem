const fs = require('fs');
const path = require('path');
const { clone } = require('./utils');

// Defaults
const defaultConfig = {
    gpioPinNumbers: [ 5, 17, 18, 27, 22, 23, 24, 25 ],
    invertPinOutput: false,
};

const configPath = path.resolve('data/config.json');

let config = null;

// Load config
if(fs.existsSync(configPath)) {
    let configContents = fs.readFileSync(configPath);
    config = JSON.parse(configContents);
}
else {
    config = clone(defaultConfig);
}

/**
 * Get the current configuration
 */
module.exports.get = () => clone(config);

/**
 * Write a new configuration
 */
module.exports.save = (newConfig) => {
    config = clone(newConfig);
    fs.writeFileSync(configPath, JSON.stringify(config));
}