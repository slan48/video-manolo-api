const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

const devConnection = process.env.DB_STRING;
const prodConnection = process.env.DB_STRING_PROD;
const testingConnection = process.env.DB_STRING_TEST;

if (process.env.NODE_ENV === 'production') {
  mongoose.connect(prodConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Database connected');
  });
} else if (process.env.NODE_ENV === 'testing') {
  mongoose.connect(testingConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Database connected');
  });
} else {
  mongoose.connect(devConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Database connected');
  });
}
