const mongoose = require('mongoose');
const router = require('express').Router();
const Movie = mongoose.model('Movie');
const Reservation = mongoose.model('Reservation');
const movieSchemas = require('../utils/schemas/movieSchemas');
const { Validator } = require('express-json-validator-middleware');
const validate = new Validator({allErrors: true}).validate;
const moment = require('moment');

// Get available movies
router.get('/available', async (req, res, next) => {
  try{
    // Check and free movies if reservation process was expired
    const pendingReservations = await Reservation.find({ status: 'pending' });

    for (const reservation of pendingReservations) {
      const reservationStartedDate = moment(reservation.updatedAt);
      const reservationStartedMinutesAgo = moment().diff(reservationStartedDate, 'minutes');
      if (reservationStartedMinutesAgo > 5){
        reservation.status = 'cancelled';
        await reservation.save();

        const movie = await Movie.findOne({_id: reservation.movie});
        movie.stock = movie.stock + 1;
        await movie.save();
      }
    }

    const movies = await Movie.find({ stock: { $gte: 1 } })
    return res.status(200).json({ success: true, movies });
  } catch (err) {
    console.log(err);
    next(err)
  }
});

// Get movie
router.get('/:id', validate({params: movieSchemas.movieIdSchema}), async (req, res, next) => {
  try{
    const movie = await Movie.findOne({ _id: req.params.id })
    if (movie){
      return res.status(200).json({ success: true, movie });
    } else{
      return res.status(404).json({success: false, message: 'Película no encontrada'})
    }
  } catch (err) {
    console.log(err);
    next(err)
  }
});

module.exports = router;
