const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth.js');

// Welcome page
router.get('/', (req, res) => res.render("welcome"));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
    res.render('dashboard', { user: req.user })
);

// Profile
router.get('/profile', ensureAuthenticated, (req, res) =>
    res.render('profile', { user: req.user })
);

module.exports = router;
