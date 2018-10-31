'use strict';
const { Strategy: LocalStrategy } = require('passport-local');

// Assigns the Strategy export to the name JwtStrategy using object destructuring
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assigning_to_new_variable_names
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../models/users');
const { JWT_SECRET } = require('../config');

const localStrategy = new LocalStrategy((username, password, callback) => {
    let user;
    User.findOne({ username: username })
        .then(_user => {
            user = _user;
            if (!user) {
                // Return a rejected promise so we break out of the chain of .thens.
                // Any errors like this will be handled in the catch block.
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            return user.validatePassword(password);
        })
        .then(isValid => {
            if (!isValid) {
                return Promise.reject({
                    reason: 'LoginError',
                    message: 'Incorrect username or password'
                });
            }
            return callback(null, user);
        })
        .catch(err => {
            if (err.reason === 'LoginError') {
                return callback(null, false, err);
            }
            return callback(err, false);
        });
});

const jwtStrategy = new JwtStrategy(
    {
        secretOrKey: JWT_SECRET,
        // Look for the JWT as a Bearer auth header
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        // Only allow HS256 tokens - the same as the ones we issue
        algorithms: ['HS256']
    },
    (payload, done) => {
        console.log('payload:', payload);
        done(null, payload.user);
    }
);

const registerStrategy = new LocalStrategy({usernameField: 'username', passwordField: 'password', passReqToCallback: true},
    (req, username, password, done) => {
        const requiredFields = ['firstName', 'lastName', 'username', 'password'];
        const missingFields = requiredFields.filter(field => !(field in req.body));
        console.log('missingFields:', missingFields);
        if (missingFields.length) {
            req.flash('errorMessage', `Missing field(s) for ${missingFields.join(', ')}`);
            return done(null, false);
        }

        const stringFields = ['firstName', 'lastName', 'username', 'password'];
        const nonStringFields = stringFields.filter(field => field in req.body && typeof req.body[field] !== 'string');

        if (nonStringFields.length) {
            req.flash('errorMessage', `Incorrect field type: expected a string for ${nonStringFields.join(', ')}`);
            return done(null, false);
        }

        const explicityTrimmedFields = ['username', 'password'];
        const nonTrimmedFields = explicityTrimmedFields.filter(field => req.body[field].trim() !== req.body[field]);

        if (nonTrimmedFields.length) {
            req.flash('errorMessage', `Cannot have white space at the beginning or end of ${nonTrimmedFields.join(', ')}`);
            return done(null, false);
        }

        const sizedFields = {
            username: {
                min: 2,
                max: 72
            },
            password: {
                min: 2,
                max: 72
            }
        };

        const fieldsTooSmall = Object.keys(sizedFields).filter(field =>
            'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min);
        console.log('fieldsTooSmall:', fieldsTooSmall);
        if (fieldsTooSmall.length) {
            req.flash('errorMessage', `These fields must be at least 2 characters long: ${fieldsTooSmall.join(', ')}`);
            return done(null, false);
        }

        const fieldsTooLarge = Object.keys(sizedFields).filter(field =>
            'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max);

        if (fieldsTooLarge.length) {
            req.flash('errorMessage', `These fields must be at most 72 characters long: ${fieldsTooLarge.join(', ')}`);
            return done(null, false);
        }

        User.findOne({username: username}, (err, user) =>{
            if (err) {
                console.log('errorMessage:', err);
                return done(err);
            }
            if (user) {
                req.flash('errorMessage', `Username ${username} already exists`);
                return done(null, false);
            }

            let newUser = new User(req.body);
            newUser.password = newUser.hashPassword(req.body.password);

            newUser.save(err => {
                console.log('errorMessage:', err);
                if (err) {
                    return done(err);
                }
                return done(null, newUser);
            });
        });
    });

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

const protectLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/pets');
};

module.exports = { localStrategy, jwtStrategy, isAuthenticated, protectLogin, registerStrategy };
