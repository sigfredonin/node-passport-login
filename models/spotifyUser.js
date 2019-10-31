const mongoose = require('mongoose');

const spotifySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    spotifyId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const spotifyUser = mongoose.model('SpotifyUser', spotifySchema);

module.exports = spotifyUser;
