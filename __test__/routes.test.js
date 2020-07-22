require('dotenv').config();

if (process.env.NODE_ENV !== 'testing'){

  console.log('Tests only work with NODE_ENV=testing');
  test.skip('No test', () => {})

} else{

  const supertest = require('supertest');
  const app = require('../server');
  const request = supertest(app);
  const mongoose = require('mongoose');

  beforeAll(async done => {
    await require('../utils/seed/seed');
    done();
  })

  afterAll(async done => {
    await mongoose.connection.dropCollection('users');
    await mongoose.connection.dropCollection('movies');
    await mongoose.connection.dropCollection('reservations');
    await mongoose.connection.close();
    done();
  });

  let adminUserInfo = {
    email: 'admin@admin.com',
    password: 'admin'
  }

  let normalUserInfo = {
    email: 'email1@email.com',
    password: '123'
  }

  let newUserInfo = {
    "email": "sergio@email.com",
    "password": "123",
    "name": "Sergio Agamez",
    "rut": "48484848",
    "address": "Calle 123",
    "phone": "+573003003030"
  }

  // Movies Routes
  describe('Movies routes', () => {
    test('Get available movies /api/movies/available', async done => {
      const res = await request.get('/api/movies/available');
      expect(res.body.movies.length).toBeGreaterThan(0);
      done();
    })

    test('Get movie /api/movies/:movieId', async done => {
      const resMovies = await request.get('/api/movies/available');
      const movieId = resMovies.body.movies[0]._id;
      const res = await request.get(`/api/movies/${movieId}`);
      expect(Object.keys(res.body.movie).length).toBeGreaterThan(0);
      done();
    })
  })

  // Users Routes
  describe('Users routes', () => {
    test('Login user /api/users/login', async done => {
      const res = await request.post('/api/users/login').send(adminUserInfo)
      expect(res.body.token).toBeTruthy();
      done();
    })

    test('Register user /api/users/register', async done => {
      const res = await request.post('/api/users/register').send(newUserInfo)
      expect(res.body.token).toBeTruthy();
      done();
    })

    test('Get users /api/users', async done => {
      const resLogin = await request.post('/api/users/login').send(adminUserInfo)
      const res = await request.get('/api/users').set('Authorization', resLogin.body.token)
      expect(res.body.users.length).toBeGreaterThan(0);
      done();
    })
  })

  // Reservations Routes
  describe('Reservations routes', () => {
    test('Start reservation /api/reservations/start', async done => {
      const resLogin = await request.post('/api/users/login').send(normalUserInfo)
      const resMovies = await request.get('/api/movies/available');
      const res = await request.post('/api/reservations/start')
        .set('Authorization', resLogin.body.token)
        .send({movieId: resMovies.body.movies[0]._id})
      expect(res.body.success).toBeTruthy();
      done();
    })

    test('Complete reservation /api/reservations/complete/:id', async done => {
      const resLogin = await request.post('/api/users/login').send(normalUserInfo)
      const resMovies = await request.get('/api/movies/available');
      const resStartReservation = await request.post('/api/reservations/start')
        .set('Authorization', resLogin.body.token)
        .send({movieId: resMovies.body.movies[0]._id})
      const res = await request.patch(`/api/reservations/complete/${resStartReservation.body.reservation._id}`)
        .set('Authorization', resLogin.body.token)
      expect(res.body.success).toBeTruthy();
      done();
    })

    test('Get all reservations /api/reservations', async done => {
      const resLogin = await request.post('/api/users/login').send(adminUserInfo)
      const res = await request.get(`/api/reservations`)
        .set('Authorization', resLogin.body.token)
      expect(res.body.success).toBeTruthy();
      done();
    })

    test('Return movie reservation /api/reservations/return/:id', async done => {
      // Start reservation
      const resLogin = await request.post('/api/users/login').send(normalUserInfo)
      const resMovies = await request.get('/api/movies/available');
      const resStartReservation = await request.post('/api/reservations/start')
        .set('Authorization', resLogin.body.token)
        .send({movieId: resMovies.body.movies[0]._id})

      // Complete reservation
      const resCompleteReservation = await request.patch(`/api/reservations/complete/${resStartReservation.body.reservation._id}`)
        .set('Authorization', resLogin.body.token)

      // Return movie reservation
      const resLoginAdmin = await request.post('/api/users/login').send(adminUserInfo)
      const resReturnReservation = await request.patch(`/api/reservations/return/${resStartReservation.body.reservation._id}`)
        .set('Authorization', resLoginAdmin.body.token)

      expect(resReturnReservation.body && resReturnReservation.body.success).toBeTruthy();
      done();
    })
  })

}
