const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const User = mongoose.model('User');
const helpers = require('../utils/helpers');
const userSchemas = require('../utils/schemas/userSchemas');
const { Validator } = require('express-json-validator-middleware');
const validate = new Validator({allErrors: true}).validate;

// Get all users (Only for admin user)
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res, next) => {
  // Check if is admin to continue
  if (!req.user.isAdmin) return res.status(401).json({success: false, message: 'Not authorized'})

  try {
    const users = await User.find();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    next(err)
  }

});

// Validate an existing user and issue a JWT
router.post('/login', validate({body: userSchemas.loginUserSchema}), async (req, res, next) => {
  try{
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid user or password" });
    }

    const isValid = await helpers.validPassword(req.body.password, user.password);

    if (isValid) {
      const tokenObject = helpers.issueJWT(user);
      return res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
    } else {
      return res.status(401).json({ success: false, message: "Invalid user or password" });
    }
  } catch (err) {
    next(err)
  }
});

// Register a new user
router.post('/register', validate({body: userSchemas.registerUserSchema}), async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      rut,
      address,
      phone
    } = req.body;

    const passwordHash = await helpers.genPassword(password);

    const newUser = new User({
      email,
      password: passwordHash,
      name,
      rut,
      address,
      phone
    });

    newUser.save()
      .then((user) => {
        const tokenObject = helpers.issueJWT(user);
        res.status(201).json({ success: true, userId: user._id, token: tokenObject.token, expiresIn: tokenObject.expires });
      })
      .catch(err => {
        next(err)
      })

  } catch (err) {
    next(err)
  }

});

module.exports = router;
