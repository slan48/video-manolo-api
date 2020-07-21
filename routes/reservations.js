const mongoose = require('mongoose');
const router = require('express').Router();
const User = mongoose.model('User');
const Movie = mongoose.model('Movie');
const Reservation = mongoose.model('Reservation');
const passport = require('passport');
const reservationSchemas = require('../utils/schemas/reservationSchemas');
const idSchema = require('../utils/schemas/idSchema');
const { Validator } = require('express-json-validator-middleware');
const validate = new Validator({allErrors: true}).validate;
const moment = require('moment');

// Get reservations
router.get('/', passport.authenticate('jwt', {session: false}), async (req, res ,next) => {
  if (!req.user.isAdmin){
    return res.status(401).json({success: false, message: 'Not authorized'})
  }

  try{
    const reservations = await Reservation.find();
    return res.status(200).json({success: true, reservations})
  } catch (err) {
    next(err)
  }
})

// Start reservation
router.post('/start',
  passport.authenticate('jwt', {session: false}),
  validate({body: reservationSchemas.createReservationSchema}),
  async (req, res, next) => {
  try{

    // Get user
    const user = await User.findOne({_id: req.user._id});
    if (!user) return res.status(404).json({success: false, message: 'User not found'})

    // Get movie
    const movie = await Movie.findOne({_id: req.body.movieId});
    if (!movie) return res.status(404).json({success: false, message: 'Movie not found'})
    if (movie.stock < 1) return res.status(200).json({success: false, message: 'Sorry, the movie is out of stock'})

    const reservation = new Reservation({
      user: user._id,
      movie: movie._id,
      status: 'pending'
    })

    reservation.save()
      .then(async (reservationSaved) => {
        // Update user
        user.reservations.push(reservationSaved._id)

        // Update movie
        movie.reservations.push(reservationSaved._id)
        movie.stock = movie.stock - 1;
        await movie.save();
        return reservationSaved;
      })
      .then(reservationSaved => {
        res.status(201).json({ success: true, reservation: reservationSaved });
      })
      .catch(err => {
        return next(err)
      })

  } catch (err) {
    next(err)
  }
});

// Complete reservation
router.patch('/complete/:id',
  passport.authenticate('jwt', {session: false}),
  validate({params: idSchema}),
  async (req, res, next) => {
    try{

      const reservation = await Reservation.findOne({_id: req.params.id});
      if (!reservation) return res.status(404).json({success: false, message: 'Reservation not found'})

      // Check if status is correct to continue
      if (reservation.status === 'cancelled') return res.status(400).json({success: false, message: 'Reservation was cancelled by time to complete expired'})

      if (reservation.status !== 'pending') return res.status(400).json({success: false, message: 'Current reservation need to be in status pending to change to reserved'})

      // Check if uncompleted reservation is expired to free stock of movie (Users have 5 minutes to complete reservation)
      const reservationStartedDate = moment(reservation.updatedAt);
      const reservationStartedMinutesAgo = moment().diff(reservationStartedDate, 'minutes');
      if (reservationStartedMinutesAgo > 5){
        reservation.status = 'cancelled';
        await reservation.save();

        const movie = await Movie.findOne({_id: reservation.movie});
        movie.stock = movie.stock + 1;
        await movie.save();

        return res.status(400).json({success: false, message: 'Reservation was cancelled by time to complete was expired'})
      }

      // Complete reservation
      reservation.status = 'reserved';
      reservation.save()
        .then(reservationSaved => {
          return res.status(200).json({success: true, message: 'Reservation completed', reservation: reservationSaved})
        })
        .catch(err => {
          return next(err)
        })

    } catch (err) {
      next(err)
    }
  });

// Return reservation
router.patch('/return/:id',
  passport.authenticate('jwt', {session: false}),
  validate({params: idSchema}),
  async (req, res, next) => {
    try{
      // Check if is admin to continue
      if (!req.user.isAdmin) return res.status(401).json({success: false, message: 'Not authorized'})

      // Get and check reservation status
      const reservation = await Reservation.findOne({_id: req.params.id});
      if (!reservation) return res.status(404).json({success: false, message: 'Reservation not found'})
      if (reservation.status !== 'reserved') return res.status(400).json({success: false, message: 'Current reservation need to be in status reserved to change to returned'})

      // Get movie
      const movie = await Movie.findOne({_id: reservation.movie})

      // Change status to returned and add stock to movie again
      reservation.status = 'returned';
      reservation.save()
        .then(async (reservationSaved) => {
          movie.stock = movie.stock + 1;
          await movie.save();
          return reservationSaved;
        })
        .then(reservationSaved => {
          return res.status(200).json({success: true, message: 'Movie returned successfully', reservation: reservationSaved})
        })
        .catch(err => {
          return next(err)
        })

    } catch (err) {
      next(err)
    }
  });

module.exports = router;
