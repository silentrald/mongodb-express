const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
    username: {
        type: String,
        maxlength: 30
    },
    password: {
        type: String,
        minlength: 60,
        maxlength: 60
    }
});

module.exports = mongoose.model('User', User);