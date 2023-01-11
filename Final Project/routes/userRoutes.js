const express = require('express');
const controller = require('../controllers/userController');
const {isGuest, isSignedIn} = require('../middlewares/auth');
const {logInLimiter} = require ('../middlewares/rateLimiter');
const {validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');

const router = express.Router();

//GET /users/new: send html form for creating a new user account

router.get('/new', isGuest, controller.new);

//POST /users: create a new user account

router.post('/', isGuest, validateSignUp, validateResult, controller.create);

//GET /users/login: send html for logging in
router.get('/signin', isGuest, controller.getUserSignin);

//POST /users/login: authenticate user's login
router.post('/signin', logInLimiter, isGuest, validateLogIn, controller.signin);

//GET /users/profile: send user's profile page
router.get('/profile', isSignedIn, controller.profile);

//POST /users/logout: logout a user
router.get('/signout', isSignedIn, controller.signout);

module.exports = router;