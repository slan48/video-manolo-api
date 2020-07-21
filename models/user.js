const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rut: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  reservations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reservation'}]
}, {timestamps: true});

mongoose.model('User', UserSchema);
