const express = require('express');
const app = express();
const router = require('./routes');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

const flash = require("connect-flash");

const passport = require('passport');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { PORT, DATABASE_URL, JWT_SECRET } = require('./config');
const DB = DATABASE_URL;

mongoose.Promise = global.Promise;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser());
app.use(cookieParser(JWT_SECRET));
app.use(session({secret: JWT_SECRET}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('common'));

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
        return res.send(204);
    }
    next();
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.use('/', router);

app.use('*', (req, res) => {
    return res.status(404).json({ message: 'Not Found' });
});

let server;

function runServer(dbURL, port) {
    return new Promise(function(resolve, reject) {
        mongoose.connect(dbURL, function(err) {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, function() {
                console.log(`listening on ${port}`);
                resolve();
            }).on('error', function(err) {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(function() {
        return new Promise(function(resolve, reject){
            console.log('closing server');
            server.close(function(err) {
                if (err) {
                    return reject(err);
                }
                resolve(err);
            });
        });
    });
}

runServer(DB, PORT).catch(function(err) {
    console.error(err);
});

module.exports = {runServer, app, closeServer};