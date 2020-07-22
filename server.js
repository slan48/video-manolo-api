const express = require('express');
const cors = require('cors');
const passport = require('passport');

/*
*  -------------- GENERAL SETUP ----------------
*/
require('dotenv').config();
const app = express();

require('./config/database');
require('./models/user');
require('./models/movie');
require('./models/reservation');

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

/**
 * -------------- ROUTES ----------------
 */
app.use('/', (req, res, next) => res.json('Bienvenido a Video Manolo API'));
app.use('/api', require('./routes'));

module.exports = app;
