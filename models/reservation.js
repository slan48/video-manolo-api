const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  movie: {type: mongoose.Schema.Types.ObjectId, ref: 'Movie'},
  status: {
    type: String,
    required: true,
    enum: ['pending', 'cancelled', 'reserved', 'returned']
  }
}, {timestamps: true});

module.exports = mongoose.model('Reservation', ReservationSchema);
