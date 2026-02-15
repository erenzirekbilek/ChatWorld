const fastify = require('../app');
const { initDB, pool } = require('../db');

let token;
let userId;

describe('👤 PROFILE ENDPOINTS', () => {
  
  beforeAll(async () => {
    await initDB();

    const registerResponse = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: `profileuser_${Date.now()}`,
        email: `profile_${Date.now()}@test.com`,
        password: 'TestPass123',
        gender: 'Female',
        country: 'Turkey',
        city: 'Izmir'
      }
    });

    expect(registerResponse.statusCode).toBe(200);
    
    const body = JSON.parse(registerResponse.payload);
    token = body.token;
    userId = body.user.id;
  });

  afterAll(async () => {
    try {
      await fastify.close();
      await pool.end();
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });

  test('GET /auth/profile/:userId - Own profile (full data)', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/auth/profile/${userId}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.user.id).toBe(userId);
  });

  test('GET /auth/profile/:userId - Not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/auth/profile/${userId}`
    });

    expect(response.statusCode).toBe(200);
  });

  test('PUT /auth/profile - Update bio', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/auth/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        bio: 'Yeni test biyografisi'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
  });

  test('PUT /auth/profile - Bio too long', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/auth/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        bio: 'x'.repeat(501)
      }
    });

    expect(response.statusCode).toBe(400);
  });
});