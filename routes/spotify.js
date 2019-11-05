const express = require('express');
const router = express.Router();
const keys = require('../config/keys');
const { ensureAuthenticated } = require('../config/auth.js');
const SpotifyWebApi = require('spotify-web-api-node');

var refreshToken;
var tokenExpires;

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  callbackURL: '/users/spotify/redirect',
  clientID: keys.spotify.clientID,
  clientSecret: keys.spotify.clientSecret
});

// Spotify
router.get('/', ensureAuthenticated, (req, res) => {
  console.log("/ accessToken: " + req.user.access.accessToken);
  refreshToken = req.user.access.refreshToken;
  tokenExpires = req.user.access.expires;
  spotifyApi.setAccessToken(req.user.access.accessToken);
  res.render('spotify', { user: req.user });
});

// Spotify Search
router.get('/search', ensureAuthenticated, (req, res) =>
    res.render('spotifySearch', { user: req.user })
);

module.exports = router;
