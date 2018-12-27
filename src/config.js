const fs = require('fs');
const path = require('path');
//const timer = require('./timer');
const { clone, checkType } = require('./utils');

// Defaults
const defaultConfig = {
    port: 1225,
    gpioPinNumbers: [ 5, 17, 18, 27, 22, 23, 24, 25 ],
    invertPinOutput: false,
    useBoardPinNumbering: false,
    gpioLogging: true,
    interShowDelay: 5,
    autoStart: false,
    autoStartTime: 1020, // 5 PM
    autoEndTime: 0, // Midnight
};

// Types
const configShape = {
    port: 'number',
    gpioPinNumbers: 'array<number>',
    invertPinOutput: 'boolean',
    useBoardPinNumbering: 'boolean',
    gpioLogging: 'boolean',
    interShowDelay: 'number',
    autoStart: 'boolean',
    autoStartTime: 'number',
    autoEndTime: 'number',
};

const configPath = path.resolve('data/config.json');

// Current config object
let config = null;

const checkConfig = dirtyConfig => {
    const cleanKeys = Object.keys(configShape);
    const cleanConfig = {};
    
    for(let key in dirtyConfig) {
        if(!cleanKeys.includes(key)) {
            // invalid word
            console.log('Invalid prop in config:', key);
        }
        else if(!checkType(dirtyConfig[key], configShape[key])) {
            // wrong type
            console.log(`Invalid type in config: '${key}' should be '${configShape[key]}', found '${typeof dirtyConfig[key]}'`);
        }
        else {
            cleanConfig[key] = dirtyConfig[key];
        }
    }
    
    return cleanConfig;
}

const writeConfig = () => fs.writeFileSync(configPath, JSON.stringify(config));

// Load config
if(fs.existsSync(configPath)) {
    console.log('config.json found, loading');
    let configContents = fs.readFileSync(configPath);
    let checkedConfig = checkConfig(JSON.parse(configContents));
    config = {
        ...defaultConfig,
        ...checkedConfig,
    };
}
else {
    console.log('No config.json found, creating');
    config = clone(defaultConfig);
}

// Save config in case we had to fix it
writeConfig(config);

/**
 * Get the current configuration
 */
get = () => clone(config);

/**
 * Write a new configuration
 * (can pass partial config object)
 */
save = (newConfig) => {
    config = clone({
        ...config,
        ...checkConfig(newConfig),
    });
    writeConfig();
    //timer.updateJobs();
}

module.exports = {
    get,
    save,
};