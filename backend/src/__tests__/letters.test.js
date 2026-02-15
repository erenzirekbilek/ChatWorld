const fastify = require('../app');
const { initDB, pool } = require('../db');

describe('✉️ LETTERS API', () => {

  let token1;
  let token2;
  let userId1;
  let userId2;
  let letterId;

  beforeAll(async () => {
    await initDB();

    // ========= USER1 REGISTER =========
    const res1 = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: `letters_user1_${Date.now()}`,
        email: `letters_user1_${Date.now()}@test.com`,
        password: 'TestPass123',
        gender: 'Male',
        country: 'Turkey',
        city: 'Istanbul'
      }
    });

    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.payload);
    token1 = body1.token;
    userId1 = body1.user.id;

    // ========= USER2 REGISTER =========
    const res2 = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: `letters_user2_${Date.now()}`,
        email: `letters_user2_${Date.now()}@test.com`,
        password: 'TestPass123',
        gender: 'Female',
        country: 'Germany',
        city: 'Berlin'
      }
    });

    expect(res2.statusCode).toBe(200);
    const body2 = JSON.parse(res2.payload);
    token2 = body2.token;
    userId2 = body2.user.id;
  });

  it('should send letter', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/letters/send',
      headers: {
        authorization: `Bearer ${token1}`
      },
      payload: {
        receiverId: userId2,
        content: 'Hello test letter'
      }
    });

    expect(res.statusCode).toBe(201);

    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.letter).toBeDefined();

    letterId = body.letter.id;
  });

  it('should get inbox', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/letters/inbox',
      headers: {
        authorization: `Bearer ${token2}`
      }
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.letters)).toBe(true);
    expect(body.letters.length).toBeGreaterThan(0);
  });

  it('should mark letter as read', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/letters/${letterId}/read`,
      headers: {
        authorization: `Bearer ${token2}`
      }
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });

  afterAll(async () => {
    try {
      await fastify.close();
      await pool.end();
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });
});