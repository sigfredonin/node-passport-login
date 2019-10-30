const mongoose = require('mongoose');

const googleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const googleUser = mongoose.model('GoogleUser', googleSchema);

module.exports = googleUser;
