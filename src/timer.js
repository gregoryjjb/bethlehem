const schedule = require('node-schedule');
const config = require('./config');
const player = require('./player');
const utils = require('./utils');

let startJob, endJob;

const isJob = job => job && typeof job.reschedule === 'function';

const extractTimes = allMinutes => {
    const hours = Math.floor(allMinutes / 60);
    const minutes = Math.floor(allMinutes % 60);
    
    return { hours, minutes };
}

const buildCronString = time => {
    const { hours, minutes } = extractTimes(time);
    return `${minutes} ${hours} * * *`;
}


const updateJobs = () => {
    const { autoStart, autoStartTime, autoEndTime } = config.get();
    
    if(!autoStart) {
        if(isJob(startJob)) startJob.cancel();
        if(isJob(endJob)) endJob.cancel();
        console.log('Disabling auto start');
        return;
    }
    
    const start = utils.clamp(autoStartTime, 0, 1439);
    const end = utils.clamp(autoEndTime, 0, 1439);
    
    const startCron = buildCronString(start);
    const endCron = buildCronString(end);
    
    console.log('Scheduling job with string', startCron);
    
    if(isJob(startJob)) startJob.reschedule(startCron);
    else startJob = schedule.scheduleJob(startCron, startFunc);
    
    if(isJob(endJob)) endJob.reschedule(endCron);
    else endJob = schedule.scheduleJob(endCron, endFunc);
}

const startFunc = () => {
    player.playAll();
}

const endFunc = () => {
    player.lightsOff();
}

module.exports = {
    updateJobs,
}