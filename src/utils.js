module.exports.clone = (obj) => JSON.parse(JSON.stringify(obj));

module.exports.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}