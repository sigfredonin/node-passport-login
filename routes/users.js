const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// login page
router.get('/login', (req, res) => res.render("login"));

// Register page
router.get('/register', (req, res) => res.render("register"));

// Handle register request
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Verify that all fields were filled in
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields." });
    }

    // Verify that passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords must match." });
    }

    // Verify that password is long enough
    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters."});
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation passed
        User.findOne( { email: email})
            .then(user => {
                if (user) {
                    // user exists
                    errors.push({ msg: "User with this email already exists."});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });            
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', "You are now registered and can log in.");
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }
});

// Handle login using local credentials
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Handle login using Google
router.get('/google', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile']
    })(req, res, next);
})

// Handle Google callback
router.get('/google/redirect', (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
})

// Handle logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', "You are logged out.");
    res.redirect('/users/login');
})

module.exports = router;