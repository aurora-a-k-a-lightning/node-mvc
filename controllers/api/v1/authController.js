const config = require('../../../config');
const jwt = require('jsonwebtoken');

const createAuthToken = function (user) {
    return jwt.sign({user}, config.JWT_SECRET, {
        subject: user.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
    });
};

function login(req, res) {
    console.log('api login');
    const authToken = createAuthToken(req.user.serialize());
    res.json({authToken});
}

function refresh(req, res) {
    const authToken = createAuthToken(req.user);
    res.json({authToken});
}

function logout(req, res) {

}

const ApiAuthController = {
    refresh: refresh,
    login: login,
    logout: logout
};

module.exports = ApiAuthController;