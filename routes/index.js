const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth.js');

// Welcome page
router.get('/', (req, res) => res.render("welcome"));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', { user: req.user })
);

// Spotify
router.get('/spotify', ensureAuthenticated, (req, res) =>
    res.render('spotify', { user: req.user })
);

// Spotify Search
router.get('/spotifySearch', ensureAuthenticated, (req, res) =>
    res.render('spotifySearch', { user: req.user })
);

// Profile
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;
