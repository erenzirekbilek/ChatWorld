# 🌍 The Slow App - Backend

A unique, distance-based letter social network where messages take time to deliver based on geographic location. Built with Node.js, Fastify, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running](#running)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security](#security)
- [Development](#development)

---

## ✨ Features

### Core Features
- **User Authentication** - Register, login with JWT tokens
- **Profile Management** - Update bio, avatar, interests
- **Letters System** - Send letters with distance-based delivery delays
  - Same city: 10-30 minutes
  - Different city: 6-24 hours
- **Friendships** - Request, accept, and manage friendships
- **Discovery** - Find users by location, gender, interests
- **Stamps Collection** - Collectible stamps awarded for sending letters
- **User Statistics** - Track sent/received letters, friends count, stamps

### Security Features
- **Password Hashing** - Argon2 with configurable parameters
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Email, UUID, password, content length validation
- **Rate Limiting** - 10 letters per hour per user
- **CORS** - Configurable cross-origin requests
- **Error Handling** - Comprehensive error messages with status codes

---

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.25+
- **Database**: PostgreSQL 12+ with pg pool
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Argon2
- **Validation**: Custom validators
- **Documentation**: Swagger/OpenAPI (coming)
- **Testing**: Jest + Supertest (setup ready)
- **Code Generation**: UUID v4

### Production-Ready Packages
```json
{
  "@fastify/cors": "^8.5.0",
  "@fastify/jwt": "^7.2.4",
  "@fastify/swagger": "^8.10.0",
  "@fastify/swagger-ui": "^1.10.0",
  "argon2": "^0.31.2",
  "dotenv": "^16.4.1",
  "pg": "^8.11.3",
  "uuid": "^9.0.1"
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 12.0 or higher
- npm or yarn

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd backend
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database setup**
```bash
# Database tables are auto-created on first run
npm run dev
```

4. **Server starts at**
```
http://localhost:3000
API Docs: http://localhost:3000/documentation
Health: http://localhost:3000/health
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/slow_app

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Optional
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
LOG_LEVEL=info
```

### Database

**Auto-created tables:**
- `users` - User accounts with profile data
- `letters` - Messages between users
- `stamps` - Collectible stamps
- `friendships` - Friend relationships

```sql
-- Manual creation (if needed)
psql -U username -d slow_app -f schema.sql
```

---

## 🏃 Running

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
All protected endpoints require Bearer token:
```bash
Authorization: Bearer <jwt-token>
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

---

## 🔐 Authentication Endpoints

### POST `/auth/register`
Register new user account

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "gender": "Male",
  "country": "Turkey",
  "city": "Istanbul"
}
```

**Validation:**
- Username: 3-30 chars (alphanumeric, underscore)
- Email: valid format
- Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number
- Gender: Male, Female, Other

**Response:** 200 OK
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### POST `/auth/login`
Authenticate and get JWT token

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

## 👤 Profile Endpoints

### GET `/auth/profile/:userId`
Get user profile (with privacy controls)

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "bio": "Software developer",
    "gender": "Male",
    "country": "Turkey",
    "city": "Istanbul",
    "avatar_url": "https://example.com/avatar.jpg",
    "interests": "coding,travel"
  },
  "isFriend": false,
  "isOwn": true
}
```

### PUT `/auth/profile`
Update own profile

**Headers:** Authorization required

**Request:**
```json
{
  "bio": "Updated bio",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "interests": "coding,gaming"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Profile updated"
}
```

---

## 💌 Letters Endpoints

### POST `/letters/send`
Send letter with distance-based delivery

**Headers:** Authorization required

**Request:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hello! How are you?"
}
```

**Delivery Time:**
- Same city: 10-30 minutes
- Different city: 6-24 hours

**Response:** 200 OK
```json
{
  "success": true,
  "letter": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "receiverId": "550e8400-e29b-41d4-a716-446655440001",
    "sentAt": "2024-01-15T10:30:00Z",
    "deliveredAt": "2024-01-15T11:15:00Z",
    "deliveryMinutes": 45
  }
}
```

**Rate Limit:** 10 letters per hour

### GET `/letters/inbox?page=1&limit=20`
Get received letters (paginated)

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "letters": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "sender_id": "550e8400-e29b-41d4-a716-446655440001",
      "content": "Hello! How are you?",
      "read": false,
      "delivered_at": "2024-01-15T11:15:00Z",
      "created_at": "2024-01-15T10:30:00Z",
      "username": "john_doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "city": "Istanbul",
      "country": "Turkey"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET `/letters/outbox?page=1&limit=20`
Get sent letters (paginated)

**Headers:** Authorization required

**Response:** Same structure as inbox

### PUT `/letters/:id/read`
Mark letter as read

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true
}
```

---

## 👥 Friendships Endpoints

### POST `/friendships/request`
Send friend request

**Headers:** Authorization required

**Request:**
```json
{
  "userId2": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

### PUT `/friendships/:id/accept`
Accept friend request

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true
}
```

### GET `/friendships`
Get friends list

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "friends": [
    {
      "friend_id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "jane_doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "city": "Ankara",
      "country": "Turkey"
    }
  ]
}
```

---

## 🔍 Discovery Endpoints

### GET `/letters/discover?country=Turkey&gender=Female`
Find new users to connect with

**Headers:** Authorization required

**Query Parameters:**
- `country` - Filter by country
- `city` - Filter by city
- `gender` - Filter by gender (Male, Female, Other)
- `username` - Search by username

**Response:** 200 OK
```json
{
  "success": true,
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "username": "jane_smith",
      "gender": "Female",
      "country": "Turkey",
      "city": "Ankara",
      "bio": "Traveler and book lover",
      "avatar_url": "https://example.com/avatar.jpg",
      "interests": "travel,books"
    }
  ]
}
```

---

## 📊 Statistics Endpoints

### GET `/letters/statistics`
Get user statistics

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "statistics": {
    "sent_count": 12,
    "received_count": 18,
    "read_count": 15,
    "friends_count": 5,
    "total_stamps": 42
  }
}
```

### GET `/letters/stamps`
Get stamp collection

**Headers:** Authorization required

**Response:** 200 OK
```json
{
  "success": true,
  "stamps": [
    { "stamp_type": "rare", "count": 5 },
    { "stamp_type": "vintage", "count": 3 },
    { "stamp_type": "modern", "count": 2 },
    { "stamp_type": "classic", "count": 1 }
  ]
}
```

---

## 🏥 Utility Endpoints

### GET `/health`
Server health check

**Response:** 200 OK
```json
{
  "status": "ok"
}
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Fastify app setup
│   ├── index.js               # Server entry point
│   ├── db.js                  # Database connection
│   ├── schema.sql             # Database schema
│   │
│   ├── config/
│   │   └── swagger.js         # Swagger configuration
│   │
│   ├── plugins/
│   │   └── swagger.js         # Swagger plugin
│   │
│   ├── routes/
│   │   ├── auth.js            # Authentication
│   │   ├── letters.js         # Letters/Messages
│   │   └── friendships.js     # Friendships
│   │
│   ├── validators/
│   │   └── index.js           # Input validators
│   │
│   └── __tests__/
│       ├── auth.test.js
│       ├── letters.test.js
│       └── friendships.test.js
│
├── .env                       # Environment variables
├── .env.example               # Example .env
├── package.json
├── README.md
└── schema.sql                 # Database schema
```

---

## 🔒 Security

### Implemented
- ✅ JWT token-based authentication
- ✅ Argon2 password hashing
- ✅ Input validation (email, password, content)
- ✅ Rate limiting (10 letters/hour per user)
- ✅ Parameterized queries (SQL injection prevention)
- ✅ Error handling with safe messages
- ✅ CORS support
- ✅ Content length validation

### Production Checklist
- [ ] Enable HTTPS/SSL
- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS for frontend domain
- [ ] Set up database backups
- [ ] Enable database SSL connections
- [ ] Add rate limiting middleware
- [ ] Set up monitoring/logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🧪 Testing

### Setup
```bash
npm install --save-dev jest supertest
```

### Run Tests
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Test Files
- `src/__tests__/auth.test.js` - Authentication endpoints
- `src/__tests__/letters.test.js` - Letters endpoints
- `src/__tests__/friendships.test.js` - Friendships endpoints

---

## 📖 API Documentation

### Swagger/OpenAPI
Once setup is complete:
```
http://localhost:3000/documentation
```

### Manual Testing
Use Postman or cURL:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "gender": "Male",
    "country": "Turkey",
    "city": "Istanbul"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get Profile (with token)
curl -X GET http://localhost:3000/auth/profile/user-id \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Development Workflow

### 1. Branch Naming
```bash
git checkout -b feature/feature-name
git checkout -b fix/bug-name
git checkout -b docs/update-readme
```

### 2. Commit Messages
```
feature: Add new endpoint for XYZ
fix: Fix bug in authentication
docs: Update README
refactor: Clean up code
test: Add tests for XYZ
```

### 3. Code Review
- Ensure tests pass
- Check for security issues
- Verify error handling
- Update documentation

---

## 🚀 Deployment

### Docker (coming soon)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

### Heroku
```bash
git push heroku main
heroku logs --tail
```

### AWS/GCP/Azure
See deployment guides in `/docs` folder (coming soon)

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ User authentication (JWT)
- ✅ Profile management
- ✅ Letters system with distance-based delivery
- ✅ Friendships system
- ✅ Discovery features
- ✅ Stamps collection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ API documentation (Swagger)

### Upcoming
- [ ] Real-time notifications (WebSocket)
- [ ] User blocking/reporting
- [ ] Search optimization
- [ ] Admin panel
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] Mobile app
- [ ] GraphQL API

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit changes
   ```bash
   git commit -m 'feature: Add amazing feature'
   ```
4. Push to branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

### Code Standards
- Use ESLint
- Follow async/await patterns
- Add tests for new features
- Document API changes
- Update README if needed

---

## 📞 Support & Contact

- **Issues**: GitHub Issues
- **Email**: support@theslowapp.com
- **Documentation**: `/docs` folder

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- Fastify team for excellent framework
- PostgreSQL team for reliable database
- Contributors and testers

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** ✅ Production Ready