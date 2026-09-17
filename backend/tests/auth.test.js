const request = require('supertest');
const app = require('../src/app');

const USER = { name: 'Test User', email: 'test@example.com', password: 'StrongPass1!' };

describe('Auth API', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(USER);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(USER.email);
  });

  test('rejects duplicate registration', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app).post('/api/auth/register').send(USER);
    expect(res.status).toBe(409);
  });

  test('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...USER, password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  test('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: USER.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(USER);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER.email, password: 'WrongPass1!' });
    expect(res.status).toBe(401);
  });

  test('returns the current user for a valid token', async () => {
    const register = await request(app).post('/api/auth/register').send(USER);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(USER.email);
  });

  test('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
