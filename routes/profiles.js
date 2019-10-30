const express = require('express');
const router = express.Router();

// Profile page
// router.get('/profile', (req, res) => res.render('profile'));
router.get('/profile', (req, res) => {
    res.send('You are logged in as user: ' + req.user.name);
});

module.exports = router;
