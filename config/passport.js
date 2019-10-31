const LocalStrategy = require('passport-local').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('./keys');

// User model
const User = require('../models/user');
const GoogleUser = require('../models/googleUser');
const SpotifyUser = require('../models/spotifyUser');

module.exports = (passport) => {

    // Login with Spotify
    passport.use(
        new SpotifyStrategy({
            // options for spotify user
            callbackURL: '/users/spotify/redirect',
            clientID: keys.spotify.clientID,
            clientSecret: keys.spotify.clientSecret
        }, (accessToken, refreshToken, expires_in, profile, done) => {
            // passport callback function
            SpotifyUser.findOne({ spotifyId: profile.id })
                .then((currentUser) => {
                    if (currentUser) {
                        // User exists in the DB
                        console.log("Existing Spotify user: " + currentUser);
                        done(null, currentUser);
                    } else {
                        // Create a new user in the DB
                        new SpotifyUser({
                            name: profile.username,
                            spotifyId: profile.id
                        }).save()
                            .then((newUser) => {
                                console.log("New Spotify user: " + newUser);
                                done(null, newUser);
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch(err => console.log(err));
            })
    );

    // Login with Google
    passport.use(
        new GoogleStrategy({
            // options for google user
            callbackURL: '/users/google/redirect',
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret
        }, (accessToken, refreshToken, profile, done) => {
            // passport callback function
            GoogleUser.findOne({ googleId: profile.id })
                .then((currentUser) => {
                    if (currentUser) {
                        // User exists in the DB
                        console.log("Existing Google user: " + currentUser);
                        done(null, currentUser);
                    } else {
                        // Create a new user in the DB
                        new GoogleUser({
                            name: profile.displayName,
                            googleId: profile.id,
                            thumbURL: profile._json.picture
                        }).save()
                            .then((newUser) => {
                                console.log("New Google user: " + newUser);
                                done(null, newUser);
                            })
                            .catch(err => console.log(err));
                    }
                })
                .catch(err => console.log(err));
            })
    );

    // Login with local credentials
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {
            // Match user
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        console.log("Existing local user: " + user);
                        done(null, false, { message: 'Email not registered.'});
                    };

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            done(null, user);
                        } else {
                            done(null, false, { message: 'Password incorrect.'});
                        }
                    })
                })
                .catch(err => console.log(err));
        })
    );

    // Serialize user identification in a session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Access user data in a session
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            if (user != null) {
                console.log("Local user deserialized: " + user);
                done(err, user);
            } else {
                GoogleUser.findById(id, (err, user) => {
                    if (user != null) {
                        console.log("Google user deserialized: " + user);
                        done(err, user);
                    } else {
                        SpotifyUser.findById(id, (err, user) => {
                            if (user != null) {
                                console.log("Spotify user deserialized: " + user);
                                done(err, user);
                            } else {
                                done(err, false, { message: 'Could not login.'});
                            }
                        })
                    }
                })
            }
        });
    });
}

