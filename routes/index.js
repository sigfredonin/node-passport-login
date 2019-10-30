const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth.js');

// Welcome page
router.get('/', (req, res) => res.render("welcome"));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => 
    res.render('dashboard', { 
        name: req.user.name
    })
);

// Profile
router.get('/profile', ensureAuthenticated, (req, res) => {
    res.send('You are logged in as user: ' + req.user.username);
});

router.get('/profile', (req, res) => {
    res.send('You are logged in as user: ' + req.user.username);
});
module.exports = router;