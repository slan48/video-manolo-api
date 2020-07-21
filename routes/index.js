const router = require('express').Router();
const { ValidationError } = require('express-json-validator-middleware');

router.use('/users', require('./users'));

// Error handler for validation errors
router.use(function(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(400).json({success: false, validationErrors: err.validationErrors});
  } else {
    next(err); // pass error on if not a validation error
  }
});

// Mongo errors
router.use(function(err, req, res, next) {
  // Duplicate unique key
  if (err.name === 'MongoError' && err.code === 11000) {
    const duplicatedKey = Object.keys(err.keyPattern)[0]
    return res.status(422).send({ success: false, message: `${duplicatedKey} already exists` });
  }
  next(err)
});

// Other errors
router.use(function(err, req, res, next) {
  res.status(500).json(err)
});

module.exports = router;
