const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const keys = require('./config/keys');
const session = require('express-session');
const passport = require('passport');

const app = express();

// Use Morgan request logging
const morgan = require('morgan');
app.use(morgan('combined'));

// Passport config
require('./config/passport')(passport);

// DB config
const db = keys.mongo.dbURI;

// Connect to Mongo DB
mongoose.connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("MongoDB connected."))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(session({
    secret: keys.session.secret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours, in milliseconds
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/spotify', require('./routes/spotify'));

// For static html files in public folder
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 8081;

app.listen(PORT, console.log(`Server started on port ${PORT}.`));
