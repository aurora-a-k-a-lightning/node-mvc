const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./config');
const PetsController = require('./controllers/petsController');
const AuthController = require('./controllers/authController');
const ApiAuthController = require('./controllers/api/v1/authController');
const { localStrategy, jwtStrategy, registerStrategy, isAuthenticated, protectLogin } = require('./strategies/auth');

// swagger ui
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// router.use('/', swaggerUi.serve);
// router.get('/', swaggerUi.setup(swaggerDocument));

// register passport strategies
const passport = require('passport');
passport.use('login', localStrategy);
passport.use('register', registerStrategy);
passport.use('jwt', jwtStrategy);
// passport.use('api-register', registerStrategy);

// api based auth strategies
const apiAuth = passport.authenticate('login', {session: false});
const jwtAuth = passport.authenticate('jwt', {session: false});
const apiRegister = passport.authenticate('register', {session: false});

// same-origin based auth strategies
const localRegister = passport.authenticate('register', {
    successRedirect: '/pets',
    failureRedirect: '/register',
    failureFlash: true
});
const localAuth = passport.authenticate('login', {
    successRedirect: '/pets',
    failureRedirect: '/login',
    failureFlash: true
});

// api routes:
router.post('/api/register', apiRegister, ApiAuthController.login); // <- actually register the user
router.get('/api/logout', ApiAuthController.logout);
router.post('/api/refresh', jwtAuth, ApiAuthController.refresh);
router.post('/api/login', apiAuth, ApiAuthController.login);

// api pets
router.get('/api/pets', jwtAuth, PetsController.index);

// same origin/model api routes:
// auth
router.get('/login', protectLogin, AuthController.login); // <- goes to the login view
router.post('/login', protectLogin, localAuth); // <- actually logs in the user

router.get('/register', protectLogin, AuthController.register); // <- goes to the register view
router.post('/register', protectLogin, localRegister); // <- actually register the user

router.get('/logout', isAuthenticated, AuthController.logout); // <- logs out the user

// pets
router.get('/pets', isAuthenticated, PetsController.index);
router.get('/pets/read/:id', PetsController.read);
router.get('/pets/create', isAuthenticated, PetsController.create);
router.post('/pets', isAuthenticated, PetsController.add);
router.get('/pets/update/:id', isAuthenticated, PetsController.update);
router.put('/pets/:id', isAuthenticated, PetsController.save);
router.delete('/pets/:id', isAuthenticated, PetsController.destroy);

module.exports = router;