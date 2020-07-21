const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const helpers = require('../utils/helpers');
const userSchemas = require('../utils/schemas/userSchemas');
const { Validator } = require('express-json-validator-middleware');
const validate = new Validator({allErrors: true}).validate;

// Validate an existing user and issue a JWT
router.post('/login', validate({body: userSchemas.loginUserSchema}), async (req, res, next) => {
  try{
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).json({ success: false, msg: "Invalid user or password" });
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
    const passwordHash = await helpers.genPassword(req.body.password);
    const newUser = new User({
      ...req.body,
      password: passwordHash
    });

    newUser.save()
      .then((user) => {
        const tokenObject = helpers.issueJWT(user);
        res.json({ success: true, userId: user._id, token: tokenObject.token, expiresIn: tokenObject.expires });
      })
      .catch(err => {
        next(err)
      })
  } catch (err) {
    next(err)
  }

});

module.exports = router;
