const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('POST /auth/register', () => {
  const postReq = async (body) => {
    return await request(app).post('/auth/register').send(body);
  };

  describe('Positive case', () => {
    test('should registration successfull when all field is valid', async () => {
      const res = await postReq({
        name: 'test',
        email: 'test@test.com',
        password: 'Test1234',
      });
      expect(res.statusCode).toBe(201);
      expect(res.body.isSuccess).toBeTruthy();
      expect(res.body.message).toMatch(/email/);
      expect(res.body.data.isEmailVerified).toBeFalsy();
    });
  });

  describe('Negative cases', () => {
    test('should throw an validation error when name is missing', async () => {
      const res = await postReq({
        name: '',
        email: '',
        password: '12345678',
      });
      expect(res.statusCode).toBe(422);
      expect(res.body.isSuccess).toBeFalsy();
      expect(res.body.message).toMatch(/empty/);
    });

    test('should throw an validation error when email is missing', async () => {
      const res = await postReq({
        name: 'test',
        email: '',
        password: '12345678',
      });
      expect(res.statusCode).toBe(422);
      expect(res.body.isSuccess).toBeFalsy();
      expect(res.body.message).toMatch(/empty/);
    });

    test('should throw an validation error when password is not contains one uppercase letter, one lowercase letter, and one number', async () => {
      const res = await postReq({
        name: 'test',
        email: 'test@test.com',
        password: '12345678',
      });
      expect(res.statusCode).toBe(422);
      expect(res.body.isSuccess).toBeFalsy();
      expect(res.body.message).toMatch(/uppercase/);
    });

    test('should throw error when email already exists', async () => {
      try {
        const res = await postReq({
          name: 'test',
          email: 'test@test.com',
          password: 'Test1234',
        });
        expect(res.statusCode).toBe(409);
        expect(res.body.isSuccess).toBeFalsy();
        expect(res.body.message).toMatch(/exists/);
      } catch (error) {
        expect(error).toBe(error);
      }
    });
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
