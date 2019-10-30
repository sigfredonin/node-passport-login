const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const keys = require('./keys');

// User model
const User = require('../models/user');
const GoogleUser = require('../models/googleUser');

module.exports = (passport) => {
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

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            if (user == null) {
                GoogleUser.findById(id, (err, user) => {
                    console.log("Google user deserialized: " + user);
                    done(err, user);
                })
            } else {
                console.log("Local user deserialized: " + user);
                done(err, user);
                }
        });
    });
}

