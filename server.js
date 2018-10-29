const express = require('express');
const app = express();
const router = require('./routes');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const DB = 'mongodb://localhost/node-mvc';
mongoose.connect(DB);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser());
app.use(morgan('common'));

app.use('/', router);

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

runServer(DB, 8080).catch(function(err) {
    console.error(err);
});

module.exports = {runServer, app, closeServer};