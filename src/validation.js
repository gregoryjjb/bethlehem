const Joi = require('joi');
const validate = require('express-validation');

module.exports.createShow = validate({
    body: {
        name: Joi.string().required(),
    }
});