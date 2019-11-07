const LocalStrategy = require('passport-local').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('./keys');

const DEBUG = process.env.DEBUG || false;

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
            const expires = new Date(Date.now() + (expires_in * 1000));
            console.log("Access Token: " + accessToken);
            console.log("Refresh Token: " + refreshToken);
            console.log("Expires in: " + expires_in);
            console.log("Expires: expires");
            let access = {
                provider: "spotify",
                accessToken: accessToken,
                refreshToken: refreshToken,
                expires: expires
            };
            // passport callback function
            SpotifyUser.findOne({ spotifyId: profile.id })
                .then((currentUser) => {
                    if (currentUser) {
                        // User exists in the DB
                        console.log("Existing Spotify user: " + currentUser);
                        currentUser.access = access;
                        done(null, currentUser);
                    } else {
                        // Create a new user in the DB
                        let userParams = {
                            name: profile.displayName,
                            spotifyId: profile.id
                        };
                        if (profile.emails && profile.emails.length > 0) {
                            userParams.email = profile.emails[0].value;
                        }
                        if (profile.pictures && profile.pictures.length > 0) {
                            userParams.thumbURL = profile.photos[0].value;
                        }
                        new SpotifyUser(userParams).save()
                            .then((newUser) => {
                                console.log("New Spotify user: " + newUser);
                                newUser.access = access;
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
            console.log("Access Token: " + accessToken);
            console.log("Refresh Token: " + refreshToken);
            let access = {
                provider: "google",
                accessToken: accessToken,
                refreshToken: refreshToken
            };
            // passport callback function
            GoogleUser.findOne({ googleId: profile.id })
                .then((currentUser) => {
                    if (currentUser) {
                        // User exists in the DB
                        console.log("Existing Google user: " + currentUser);
                        currentUser.access = access;
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
                                newUser.access = access;
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
                        done(null, false, { message: 'Email not registered.'});
                    };
                    console.log("Existing local user: " + user);

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            user.access = { provider: 'local' };
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
        done(null, { id: user.id, access: user.access });
    });

    // Access user data in a session
    passport.deserializeUser((params, done) => {
        if (DEBUG) {
            console.log("Deserializing...");
            console.log("  id: " + params.id);
            console.log("  provider: " + params.access.provider);
            console.log("  accessToken: " + params.access.accessToken);
            console.log("  refreshToken: " + params.access.refreshToken);
            console.log("  expires: " + params.access.expires);
        }
        User.findById(params.id, (err, user) => {
            if (user != null) {
                user.access = params.access;
                if (DEBUG) console.log("Local user deserialized: " + user);
                done(err, user);
            } else {
                GoogleUser.findById(params.id, (err, user) => {
                    if (user != null) {
                        user.access = params.access;
                        if (DEBUG) console.log("Google user deserialized: " + user);
                        done(err, user);
                    } else {
                        SpotifyUser.findById(params.id, (err, user) => {
                            if (user != null) {
                                user.access = params.access;
                                if (DEBUG) console.log("Spotify user deserialized: " + user);
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
