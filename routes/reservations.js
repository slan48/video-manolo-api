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
    return res.status(401).json({success: false, message: 'Usuario no autorizado'})
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
    if (!user) return res.status(404).json({success: false, message: 'Usuario no encontrado'})

    // Get movie
    const movie = await Movie.findOne({_id: req.body.movieId});
    if (!movie) return res.status(404).json({success: false, message: 'Película no encontrada'})
    if (movie.stock < 1) return res.status(200).json({success: false, message: 'La película que intenta reservar no cuenta con unidades disponibles, intente nuevamente en unos minutos'})

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
      if (!reservation) return res.status(404).json({success: false, message: 'Reservación no encontrada'})

      // Check if status is correct to continue
      if (reservation.status === 'cancelled') return res.status(400).json({success: false, message: 'La reservación ha sido cancelada debido a que se alcanzó el tiempo de expiración'})

      if (reservation.status !== 'pending') return res.status(400).json({success: false, message: 'La reservación debe estar en estado "pending" para poder cambiar a estado "reserved"'})

      // Check if uncompleted reservation is expired to free stock of movie (Users have 5 minutes to complete reservation)
      const reservationStartedDate = moment(reservation.updatedAt);
      const reservationStartedMinutesAgo = moment().diff(reservationStartedDate, 'minutes');
      if (reservationStartedMinutesAgo > 5){
        reservation.status = 'cancelled';
        await reservation.save();

        const movie = await Movie.findOne({_id: reservation.movie});
        movie.stock = movie.stock + 1;
        await movie.save();

        return res.status(400).json({success: false, message: 'La reservación ha sido cancelada debido a que se alcanzó el tiempo de expiración'})
      }

      // Complete reservation
      reservation.status = 'reserved';
      reservation.save()
        .then(reservationSaved => {
          return res.status(200).json({success: true, message: 'Reservación completada', reservation: reservationSaved})
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
      if (!req.user.isAdmin) return res.status(401).json({success: false, message: 'Usuario no autorizado'})

      // Get and check reservation status
      const reservation = await Reservation.findOne({_id: req.params.id});
      if (!reservation) return res.status(404).json({success: false, message: 'Reservación no encontrada'})
      if (reservation.status !== 'reserved') return res.status(400).json({success: false, message: 'La reservación debe estar en estado "reserved" para poder cambiar a estado "returned"'})

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
          return res.status(200).json({success: true, message: 'Película devuelta exitosamente', reservation: reservationSaved})
        })
        .catch(err => {
          return next(err)
        })

    } catch (err) {
      next(err)
    }
  });

module.exports = router;
