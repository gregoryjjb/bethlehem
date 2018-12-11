module.exports.clone = (obj) => JSON.parse(JSON.stringify(obj));

module.exports.sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

const checkType = (val, type) => {
    
    if(typeof type !== 'string') return false;
    
    // Array
    if(/^array(<\S*>)?$/g.test(type)) {
        // If is not array
        if(!Array.isArray(val)) return false;
        
        // If does not have subtype
        let subtype = type.replace(/^array<?/, '').replace(/>?$/, '');
        if(subtype === '') return true;
        
        // If does have subtype, check and reduce
        return Array.isArray(val) && val.reduce((accum, el) => {
            return accum && checkType(el, subtype);
        }, true);
    }
    
    // Anything but an array
    return typeof val === type;
}

module.exports.checkType = checkType;