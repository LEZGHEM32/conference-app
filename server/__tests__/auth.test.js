const request = require('supertest');
const app = require('../index');

describe('Auth Routes', () => {
  const testEmail = `test_${Date.now()}@example.com`;

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: testEmail,
      password: 'password123',
      role: 'participant',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('participant');
  });

  it('logs in existing user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});
