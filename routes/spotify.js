const express = require('express');
const router = express.Router();
const keys = require('../config/keys');
const { ensureAuthenticated } = require('../config/auth.js');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');
const Album = require('../spotify/album');
const Artist = require('../spotify/artist');
const Track = require('../spotify/track');
const Playlist = require('../spotify/playlist');

const PAGE = 10;

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
  refreshToken = req.user.access.refreshToken;
  tokenExpires = req.user.access.expires;
  spotifyApi.setAccessToken(req.user.access.accessToken);
  res.render('spotify', { user: req.user });
});

// Spotify Search
router.get('/search', ensureAuthenticated, (req, res) =>
  res.render('spotifySearch', { user: req.user })
);

router.post('/search', ensureAuthenticated, (req, res) => {
  // Ask Spotify to search for the requested item ...
  const { search_term } = req.body;
  const types = "album,artist,track,playlist";  // search for any
  const limit = `${PAGE}`;
  const endpointURL = "https://api.spotify.com/v1/search";
  const queryString = encodeURI(
      'q=' + search_term
    + '&type=' + types
    + '&limit=' + limit
  );
  const header = {
    Authorization: 'Bearer ' + req.user.access.accessToken
  };
  console.log(".. %O", header);
  axios.get(endpointURL+'?'+queryString, {
    headers: header
  })
  .then(response => {
    // Albums
    const albums = response.data.albums.items.map((album) => {
      return new Album(album);
    });
    const firstAlbum = new Album(response.data.albums.items[0]);
    console.log("First Album: %O", firstAlbum);
    // Artists
    const artists = response.data.artists.items.map((artist) => {
      return new Artist(artist);
    });
    const firstArtist = new Artist(response.data.artists.items[0]);
    console.log("First Artist: %O", firstArtist);
    // Tracks
    const tracks = response.data.tracks.items.map((track) => {
      return new Track(track);
    });
    const firstTrack = new Track(response.data.tracks.items[0]);
    console.log("First Track: %O", firstTrack);
    // Playlists
    const playlists = response.data.playlists.items.map((playlist) => {
      return new Playlist(playlist);
    });
    const firstPlaylist = new Playlist(response.data.playlists.items[0]);
    console.log("First Playlist: %O", firstPlaylist);
    // Add response data to req.user
    req.user.spotifyResponse = {
      albums: albums,
      artists: artists,
      tracks: tracks,
      playlists: playlists
    };
    // Render the result in the table on the search page ...
    req.user.searchResults = "RESULTS for " + queryString;
    res.render('spotifySearch', { user: req.user })
  })
  .catch(error => {
    console.log('Error: %O', error);
    req.user.searchResults = "ERROR: "
      + error.status
      + ' : '
      + error.message;
    req.user.searchError = error.status + ':' + error.message;
    res.render('spotifySearch', { user: req.user })
  });
})

module.exports = router;
