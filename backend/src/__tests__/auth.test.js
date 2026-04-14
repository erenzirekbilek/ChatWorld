const fastify = require('../app');
const { initDB, pool } = require('../db');

let token;
let userId;
const uniqueSeed = Date.now();

describe('🔐 AUTH ENDPOINTS', () => {
  
  beforeAll(async () => {
    await initDB();
  });

  afterAll(async () => {
    try {
      await fastify.close();
      await pool.end();
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });

  test('POST /auth/register - Success', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: `user_${uniqueSeed}`,
        email: `test_${uniqueSeed}@example.com`,
        password: 'TestPass123',
        gender: 'Male',
        country: 'Turkey',
        city: 'Istanbul'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.user).toBeDefined();

    token = body.token;
    userId = body.user.id;
  });

  test('POST /auth/login - Success', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: `test_${uniqueSeed}@example.com`,
        password: 'TestPass123'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.token).toBeDefined();
    expect(body.success).toBe(true);
  });

  test('GET /auth/profile/:userId - Own profile', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/auth/profile/${userId}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.user).toBeDefined();
  });

  test('GET /auth/profile/:userId - Not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/auth/profile/${userId}`
    });

    // Should return 200 but without sensitive data, or 401
    expect([200, 401]).toContain(response.statusCode);
  });
});