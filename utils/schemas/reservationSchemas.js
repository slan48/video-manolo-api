/*
 * -------------- JSON SCHEMAS ----------------
 */

const createReservationSchema = {
  type: 'object',
  required: ['movieId'],
  properties: {
    movieId: {
      type: 'string',
    }
  }
}

const completeReservationSchema = {
  type: 'object',
  required: ['reservationId'],
  properties: {
    reservationId: {
      type: 'string',
    }
  }
}

module.exports = {
  createReservationSchema,
  completeReservationSchema
}
