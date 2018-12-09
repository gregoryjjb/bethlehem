const Joi = require('joi');
const validate = require('express-validation');

const { check } = require('express-validator/check');

//module.exports.createShow = validate({
//    body: {
//        name: Joi.string().required(),
//    }
//});

const errorStopper = (err, req, res, next) => {
    if(err) {
        //console.log("WE STOPPED AN ERROR");
        return res.status(400).json({ error: 'validation error', errors: err.errors })
    }
    else {
        next();
    }
}

const createValidator = (body) => [
    validate({ body }),
    errorStopper,
]

module.exports.createShow = createValidator({ name: Joi.string().required() });