const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actors: [String],
  directors: [String],
  stock: {
    type: Number,
    required: true
  },
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }]
}, {timestamps: true});

mongoose.model('Movie', MovieSchema);
