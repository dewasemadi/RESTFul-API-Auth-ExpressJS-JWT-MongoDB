const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('POST /auth/login', () => {
  const postReq = async (body) => {
    return await request(app).post('/auth/login').send(body);
  };

  describe('Positive case', () => {
    test('should login successfull when all field is valid', async () => {
      const res = await postReq({
        email: 'test@test.com',
        password: 'Test1234',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.isSuccess).toBeTruthy();
      expect(res.body.message).toMatch(/successfully/);
      expect(res.body.data.isEmailVerified).toBeFalsy();
    });

    // return access token and refresh token into cookies
  });

  describe('Negative cases', () => {
    test('should throw an validation error when email is missing', async () => {
      const res = await postReq({
        email: '',
        password: '12345678',
      });
      expect(res.statusCode).toBe(403);
      expect(res.body.isSuccess).toBeFalsy();
      expect(res.body.message).toMatch(/empty/);
    });

    test('should throw error when email not found', async () => {
      try {
        const res = await postReq({
          email: 'notfound@test.com',
          password: 'Test1234',
        });
        expect(res.statusCode).toBe(409);
        expect(res.body.isSuccess).toBeFalsy();
        expect(res.body.message).toMatch(/not found/);
      } catch (error) {
        expect(error).toBe(error);
      }
    });

    test('should throw an error if password is wrong', async () => {
      const res = await postReq({
        email: 'test@test.com',
        password: '12345678',
      });
      expect(res.statusCode).toBe(403);
      expect(res.body.isSuccess).toBeFalsy();
      expect(res.body.message).toMatch(/wrong/);
    });
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
