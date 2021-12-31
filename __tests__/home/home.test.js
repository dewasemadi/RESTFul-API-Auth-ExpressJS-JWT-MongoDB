const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('GET /', () => {
  test('Should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Welcome/);
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
