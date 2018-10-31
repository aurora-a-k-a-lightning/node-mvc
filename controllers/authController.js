'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

function login(req, res) {
    const errorMessage = req.flash('errorMessage');
    res.render('users/login', {errorMessage: errorMessage});
}

function register(req, res) {
    const errorMessage = req.flash('errorMessage');
    res.render('users/register', {errorMessage: errorMessage});
}

function logout(req, res) {
    req.logout();
    req.flash('sucessMessage', 'You have been successfully logged out!');
    res.redirect('/login');
}

const AuthController = {
    login: login,
    logout: logout,
    register: register
};

module.exports = AuthController;