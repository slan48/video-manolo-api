const express = require('express');
const cors = require('cors');
const passport = require('passport');

/*
*  -------------- GENERAL SETUP ----------------
*/
require('dotenv').config();
const app = express();

require('./config/database');

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

/**
 * -------------- ROUTES ----------------
 */
app.use(require('./routes'));

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000);
