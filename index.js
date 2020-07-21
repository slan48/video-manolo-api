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
app.use('/api', require('./routes'));

/**
 * -------------- SERVER ----------------
 */

app.listen(process.env.PORT, () => {
  console.log(`Server up and listening at port ${process.env.PORT}`);
});
