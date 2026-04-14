const fastify = require('../app');
const { initDB, pool } = require('../db');

let token;
let userId;
let otherUserId;
let otherToken;

describe('👤 PROFILE ENDPOINTS', () => {
  
  beforeAll(async () => {
    await initDB();

    // Test user 1 kaydı
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

    // Test user 2 kaydı (discover için)
    const registerResponse2 = await fastify.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        username: `otheruser_${Date.now()}`,
        email: `other_${Date.now()}@test.com`,
        password: 'TestPass123',
        gender: 'Male',
        country: 'Turkey',
        city: 'Istanbul'
      }
    });

    expect(registerResponse2.statusCode).toBe(200);
    
    const body2 = JSON.parse(registerResponse2.payload);
    otherToken = body2.token;
    otherUserId = body2.user.id;
  });

  afterAll(async () => {
    try {
      await fastify.close();
      await pool.end();
    } catch (err) {
      console.error("Cleanup error:", err);
    }
  });

  // ============ DISCOVER TESTS ============

  test('GET /discover - Get all users (authenticated)', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/discover',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
    
    // Should not include current user
    const userIds = body.users.map(u => u.id);
    expect(userIds).not.toContain(userId);
    
    // Check user structure
    const user = body.users[0];
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user).toHaveProperty('bio');
    expect(user).toHaveProperty('gender');
    expect(user).toHaveProperty('country');
    expect(user).toHaveProperty('city');
    expect(user).toHaveProperty('avatar_url');
  });

  test('GET /discover - Filter by gender', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/discover?gender=Male',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    
    // All users should have gender Male
    body.users.forEach(user => {
      expect(user.gender).toBe('Male');
    });
  });

  test('GET /discover - Filter by country', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/discover?country=Turkey',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    
    // All users should be from Turkey
    body.users.forEach(user => {
      expect(user.country).toBe('Turkey');
    });
  });

  test('GET /discover - Filter by username', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/discover?username=otheruser',
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.users.length).toBeGreaterThan(0);
    
    // Should contain username with "otheruser"
    expect(body.users.some(u => u.username.includes('otheruser'))).toBe(true);
  });

  test('GET /discover - Not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/discover'
    });

    expect(response.statusCode).toBe(401);
  });

  // ============ PROFILE GET TESTS ============

  test('GET /profile/:id - Get user profile', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/profile/${otherUserId}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
    expect(body.user.id).toBe(otherUserId);
    expect(body.user).toHaveProperty('username');
    expect(body.user).toHaveProperty('gender');
    expect(body.user).toHaveProperty('country');
    expect(body.user).toHaveProperty('city');
  });

  test('GET /profile/:id - User not found', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    
    const response = await fastify.inject({
      method: 'GET',
      url: `/profile/${fakeId}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(404);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toBe('User not found');
  });

  test('GET /profile/:id - Not authenticated', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: `/profile/${otherUserId}`
    });

    expect(response.statusCode).toBe(401);
  });

  // ============ PROFILE UPDATE TESTS ============

  test('PUT /profile - Update bio', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
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
    expect(body.message).toBe('Profile updated successfully');
  });

  test('PUT /profile - Update avatar_url', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        avatar_url: 'https://example.com/avatar.jpg'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
  });

  test('PUT /profile - Update interests', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        interests: 'reading, travel, coding'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
  });

  test('PUT /profile - Update all fields', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        bio: 'Updated bio text',
        avatar_url: 'https://example.com/new-avatar.jpg',
        interests: 'gaming, music, sports'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(true);
  });

  test('PUT /profile - Bio too long', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        bio: 'x'.repeat(501)
      }
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('500 characters');
  });

  test('PUT /profile - Interests too long', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        interests: 'x'.repeat(201)
      }
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toContain('200 characters');
  });

  test('PUT /profile - No fields to update', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {}
    });

    expect(response.statusCode).toBe(400);
    
    const body = JSON.parse(response.payload);
    expect(body.success).toBe(false);
    expect(body.error).toBe('No fields to update');
  });

  test('PUT /profile - Not authenticated', async () => {
    const response = await fastify.inject({
      method: 'PUT',
      url: '/profile',
      payload: {
        bio: 'Test bio'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  // ============ VERIFY UPDATES ============

  test('Verify profile updates persisted', async () => {
    // First update profile
    await fastify.inject({
      method: 'PUT',
      url: '/profile',
      headers: {
        authorization: `Bearer ${token}`
      },
      payload: {
        bio: 'Persisted bio',
        interests: 'test interests'
      }
    });

    // Then fetch profile
    const response = await fastify.inject({
      method: 'GET',
      url: `/profile/${userId}`,
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.payload);
    expect(body.user.bio).toBe('Persisted bio');
    expect(body.user.interests).toBe('test interests');
  });
});