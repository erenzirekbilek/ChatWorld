const fastify = require('../app');
const { initDB, pool } = require('../db');

describe('👥 FRIENDSHIPS API', () => {
  let token1, token2, token3;
  let userId1, userId2, userId3;
  let friendshipId;

  beforeAll(async () => {
    await initDB();

    // Register 3 test users
    for (let i = 1; i <= 3; i++) {
      const res = await fastify.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          username: `friend_user${i}_${Date.now()}`,
          email: `friend${i}_${Date.now()}@test.com`,
          password: 'TestPass123',
          gender: 'Male',
          country: 'Turkey',
          city: 'Istanbul'
        }
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);

      if (i === 1) {
        token1 = body.token;
        userId1 = body.user.id;
      } else if (i === 2) {
        token2 = body.token;
        userId2 = body.user.id;
      } else {
        token3 = body.token;
        userId3 = body.user.id;
      }
    }
  });

  afterAll(async () => {
    try {
      await fastify.close();
      await pool.end();
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  });

  // ===================================
  // POST /friendships/request
  // ===================================
  it('should send friend request', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token1}` },
      payload: { userId2 }
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.friendship.status).toBe('pending');

    // Save friendship ID for later tests
    const allFriendships = await pool.query(
      `SELECT id FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) 
       AND (user_id_1 = $2 OR user_id_2 = $2)`,
      [userId1, userId2]
    );
    friendshipId = allFriendships.rows[0].id;
  });

  it('should reject self friend request', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token1}` },
      payload: { userId2: userId1 }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('yourself');
  });

  it('should reject invalid userId format', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token1}` },
      payload: { userId2: 'invalid-uuid' }
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('Invalid userId');
  });

  it('should reject non-existent user', async () => {
    const res = await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token1}` },
      payload: { userId2: '00000000-0000-0000-0000-000000000000' }
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error).toContain('not found');
  });

  // ===================================
  // PUT /friendships/:id/accept
  // ===================================
  it('should accept friend request', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/friendships/${friendshipId}/accept`,
      headers: { authorization: `Bearer ${token2}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.friendship.status).toBe('accepted');
  });

  it('should reject accepting non-pending request', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/friendships/${friendshipId}/accept`,
      headers: { authorization: `Bearer ${token2}` }
    });

    expect(res.statusCode).toBe(400);
  });

  // ===================================
  // GET /friendships
  // ===================================
  it('should get friends list', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/friendships',
      headers: { authorization: `Bearer ${token1}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.friends).toBeInstanceOf(Array);
    expect(body.count).toBeGreaterThan(0);
  });

  // ===================================
  // GET /friendships/pending
  // ===================================
  it('should get pending requests', async () => {
    // Send another request
    await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token1}` },
      payload: { userId2: userId3 }
    });

    const res = await fastify.inject({
      method: 'GET',
      url: '/friendships/pending',
      headers: { authorization: `Bearer ${token3}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.pending_requests).toBeInstanceOf(Array);
    // En az 1 pending request olmalı (from token1 to token3)
    expect(body.pending_requests.length).toBeGreaterThan(0);
  });

  // ===================================
  // PUT /friendships/:id/reject
  // ===================================
  it('should reject friend request', async () => {
    // Get pending friendship
    const pending = await pool.query(
      `SELECT id FROM friendships 
       WHERE (user_id_1 = $1 OR user_id_2 = $1) 
       AND (user_id_1 = $2 OR user_id_2 = $2)
       AND status = 'pending'`,
      [userId1, userId3]
    );

    const rejectId = pending.rows[0].id;

    const res = await fastify.inject({
      method: 'PUT',
      url: `/friendships/${rejectId}/reject`,
      headers: { authorization: `Bearer ${token3}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });

  // ===================================
  // PUT /friendships/:id/block
  // ===================================
  it('should block user', async () => {
    const res = await fastify.inject({
      method: 'PUT',
      url: `/friendships/${friendshipId}/block`,
      headers: { authorization: `Bearer ${token1}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.friendship.status).toBe('blocked');
  });

  // ===================================
  // DELETE /friendships/:id
  // ===================================
  it('should unfriend user', async () => {
    // Create new friendship first
    await fastify.inject({
      method: 'POST',
      url: '/friendships/request',
      headers: { authorization: `Bearer ${token2}` },
      payload: { userId2: userId3 }
    });

    const all = await pool.query(
      `SELECT id FROM friendships WHERE (user_id_1 = $1 OR user_id_2 = $1) 
       AND (user_id_1 = $2 OR user_id_2 = $2)`,
      [userId2, userId3]
    );
    const deleteId = all.rows[0].id;

    const res = await fastify.inject({
      method: 'DELETE',
      url: `/friendships/${deleteId}`,
      headers: { authorization: `Bearer ${token2}` }
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });

  // ===================================
  // Error Cases
  // ===================================
  it('should reject unauthenticated requests', async () => {
    const res = await fastify.inject({
      method: 'GET',
      url: '/friendships'
    });

    expect(res.statusCode).toBe(401);
  });

  it('should reject unauthorized friendship operations', async () => {
    const res = await fastify.inject({
      method: 'DELETE',
      url: `/friendships/${friendshipId}`,
      headers: { authorization: `Bearer ${token3}` }
    });

    expect(res.statusCode).toBe(403);
  });
});