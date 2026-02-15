\# 🌍 ChatWorld Backend

A modern, secure Node.js/Fastify backend for a social messaging and friendship platform.

\## 📋 Table of Contents

\- \[Features\](#features)

\- \[Tech Stack\](#tech-stack)

\- \[Installation\](#installation)

\- \[Configuration\](#configuration)

\- \[Running\](#running)

\- \[API Documentation\](#api-documentation)

\- \[Testing\](#testing)

\- \[Project Structure\](#project-structure)

\- \[Security\](#security)

\- \[Contributing\](#contributing)

\---

\## ✨ Features

\### Core Features

\- \*\*User Authentication\*\* - Register, login, and token-based auth

\- \*\*Profile Management\*\* - Update bio, avatar, and user information

\- \*\*Letters/Messages\*\* - Send and receive messages between users

\- \*\*Friendships\*\* - Request, accept, reject, and block users

\- \*\*Gamification\*\* - Stamps collection system (coming soon)

\### Security Features

\- \*\*Rate Limiting\*\* - 100 requests/15min globally, 5 requests/15min for auth endpoints

\- \*\*Security Headers\*\* - XSS protection, CSP, clickjacking prevention

\- \*\*Input Validation\*\* - Email, UUID, password, and bio validation

\- \*\*Password Hashing\*\* - Argon2 password hashing

\- \*\*Authentication\*\* - Token-based authentication with Base64 encoding

\---

\## 🛠️ Tech Stack

\- \*\*Runtime\*\*: Node.js 18+

\- \*\*Framework\*\*: Fastify 5.1+

\- \*\*Database\*\*: PostgreSQL with connection pooling

\- \*\*Authentication\*\*: Base64 token encoding (JWT recommended for production)

\- \*\*Password Hashing\*\*: Argon2

\- \*\*Security\*\*: Helmet, Rate Limit

\- \*\*Testing\*\*: Jest

\- \*\*Code Generation\*\*: UUID v4

\---

\## 📦 Installation

\### Prerequisites

\- Node.js 18.0.0 or higher

\- PostgreSQL 12.0 or higher

\- npm or yarn

\### Setup

1\. \*\*Clone the repository\*\*

\`\`\`bash

git clone https://github.com/yourusername/chatworld-backend.git

cd chatworld-backend

\`\`\`

2\. \*\*Install dependencies\*\*

\`\`\`bash

npm install

\`\`\`

3\. \*\*Install security dependencies\*\*

\`\`\`bash

npm install @fastify/rate-limit @fastify/helmet

\`\`\`

\---

\## ⚙️ Configuration

\### Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env

\# Database

DATABASE\_URL=postgresql://username:password@localhost:5432/chatworld

\# Environment

NODE\_ENV=development

\# Server

PORT=3000

HOST=0.0.0.0

\`\`\`

\*\*Production Example:\*\*

\`\`\`env

DATABASE\_URL=postgresql://user:pass@prod-db.example.com:5432/chatworld

NODE\_ENV=production

\`\`\`

\---

\## 🚀 Running

\### Development

\`\`\`bash

npm run dev

\`\`\`

\### Production

\`\`\`bash

npm start

\`\`\`

\### Testing

\`\`\`bash

npm test

\`\`\`

\### Testing with Coverage

\`\`\`bash

npm test -- --coverage

\`\`\`

\---

\## 📚 API Documentation

\### Base URL

\`\`\`

http://localhost:3000

\`\`\`

\### Authentication

All protected endpoints require an \`Authorization\` header with a Bearer token:

\`\`\`

Authorization: Bearer

\`\`\`

\### Response Format

All responses are JSON:

\`\`\`json

{

"success": true,

"data": {},

"message": "Optional message"

}

\`\`\`

\---

\## 🔐 Authentication Endpoints

\### Register User

\`\`\`http

POST /auth/register

Content-Type: application/json

{

"username": "john\_doe",

"email": "john@example.com",

"password": "SecurePass123",

"gender": "Male",

"country": "Turkey",

"city": "Istanbul"

}

Response: 200 OK

{

"success": true,

"token": "base64-encoded-token",

"user": {

"id": "uuid",

"username": "john\_doe",

"email": "john@example.com"

}

}

\`\`\`

\### Login

\`\`\`http

POST /auth/login

Content-Type: application/json

{

"email": "john@example.com",

"password": "SecurePass123"

}

Response: 200 OK

{

"success": true,

"token": "base64-encoded-token",

"user": {

"id": "uuid",

"username": "john\_doe",

"email": "john@example.com"

}

}

\`\`\`

\### Get User Profile

\`\`\`http

GET /auth/profile/:userId

Authorization: Bearer

Response: 200 OK

{

"success": true,

"user": {

"id": "uuid",

"username": "john\_doe",

"email": "john@example.com",

"bio": "Software developer",

"gender": "Male",

"country": "Turkey",

"city": "Istanbul",

"avatar\_url": "https://..."

}

}

\`\`\`

\---

\## 💬 Letters (Messages) Endpoints

\### Send Letter

\`\`\`http

POST /letters/send

Authorization: Bearer

Content-Type: application/json

{

"receiverId": "recipient-uuid",

"content": "Hello! How are you?"

}

Response: 201 Created

{

"success": true,

"letter": {

"id": "uuid",

"sender\_id": "uuid",

"receiver\_id": "uuid",

"content": "Hello! How are you?",

"read": false

}

}

\`\`\`

\### Get Inbox

\`\`\`http

GET /letters/inbox

Authorization: Bearer

Response: 200 OK

{

"success": true,

"letters": \[

{

"id": "uuid",

"sender\_id": "uuid",

"receiver\_id": "uuid",

"content": "Hello! How are you?",

"read": false,

"created\_at": "2024-01-15T10:30:00Z"

}

\]

}

\`\`\`

\### Mark Letter as Read

\`\`\`http

PUT /letters/:letterId/read

Authorization: Bearer

Response: 200 OK

{

"success": true,

"message": "Letter marked as read"

}

\`\`\`

\---

\## 👥 Friendships Endpoints

\### Send Friend Request

\`\`\`http

POST /friendships/request

Authorization: Bearer

Content-Type: application/json

{

"userId2": "friend-uuid"

}

Response: 201 Created

{

"success": true,

"message": "Friend request sent",

"friendship": {

"id": "uuid",

"status": "pending",

"created\_at": "2024-01-15T10:30:00Z"

}

}

\`\`\`

\### Accept Friend Request

\`\`\`http

PUT /friendships/:friendshipId/accept

Authorization: Bearer

Response: 200 OK

{

"success": true,

"message": "Friend request accepted",

"friendship": {

"id": "uuid",

"status": "accepted"

}

}

\`\`\`

\### Reject Friend Request

\`\`\`http

PUT /friendships/:friendshipId/reject

Authorization: Bearer

Response: 200 OK

{

"success": true,

"message": "Friend request rejected"

}

\`\`\`

\### Get Friends List

\`\`\`http

GET /friendships

Authorization: Bearer

Response: 200 OK

{

"success": true,

"friends": \[

{

"friend\_id": "uuid",

"username": "jane\_doe",

"avatar\_url": "https://...",

"city": "Istanbul",

"country": "Turkey",

"bio": "Designer"

}

\],

"count": 5

}

\`\`\`

\### Get Pending Requests

\`\`\`http

GET /friendships/pending

Authorization: Bearer

Response: 200 OK

{

"success": true,

"pending\_requests": \[

{

"id": "uuid",

"other\_user\_id": "uuid",

"other\_username": "john\_doe",

"other\_avatar\_url": "https://...",

"request\_type": "received",

"created\_at": "2024-01-15T10:30:00Z"

}

\],

"count": 2

}

\`\`\`

\### Block User

\`\`\`http

PUT /friendships/:friendshipId/block

Authorization: Bearer

Response: 200 OK

{

"success": true,

"message": "User blocked",

"friendship": {

"id": "uuid",

"status": "blocked"

}

}

\`\`\`

\### Unfriend

\`\`\`http

DELETE /friendships/:friendshipId

Authorization: Bearer

Response: 200 OK

{

"success": true,

"message": "Friendship removed"

}

\`\`\`

\---

\## 👤 Profile Endpoints

\### Update Profile

\`\`\`http

PUT /auth/profile

Authorization: Bearer

Content-Type: application/json

{

"bio": "Updated bio text"

}

Response: 200 OK

{

"success": true,

"message": "Profile updated"

}

\`\`\`

\---

\## 🧪 Testing

Run all tests:

\`\`\`bash

npm test

\`\`\`

Run tests in watch mode:

\`\`\`bash

npm test -- --watch

\`\`\`

Run specific test file:

\`\`\`bash

npm test auth.test.js

\`\`\`

\---

\## 📁 Project Structure

\`\`\`

src/

├── app.js # Fastify application setup

├── server.js # Server entry point

├── db.js # Database connection & initialization

├── schema.sql # Database schema

│

├── routes/

│ ├── auth.js # Authentication endpoints

│ ├── profile.js # Profile management

│ ├── letters.js # Letters/Messages

│ ├── friendships.js # Friendships management

│

├── plugins/

│ └── security.js # Rate limiting & security headers

│

├── utils/

│ └── validators.js # Input validation functions

│

└── \_\_tests\_\_/

├── auth.test.js

├── profile.test.js

├── letters.test.js

└── friendships.test.js

\`\`\`

\---

\## 🔒 Security

\### Best Practices Implemented

1\. \*\*Rate Limiting\*\*

\- 100 requests per 15 minutes (global)

\- 5 requests per 15 minutes for authentication endpoints

\- IP-based and user ID-based tracking

2\. \*\*Security Headers\*\*

\- XSS Protection: \`X-XSS-Protection: 1; mode=block\`

\- Content Security Policy enabled

\- Clickjacking prevention: \`X-Frame-Options: DENY\`

\- MIME type sniffing prevention: \`X-Content-Type-Options: nosniff\`

3\. \*\*Authentication\*\*

\- Token-based authentication

\- Argon2 password hashing

\- UUID for user IDs

4\. \*\*Input Validation\*\*

\- Email format validation

\- UUID format validation

\- Password strength requirements

\- Bio length restrictions (max 500 chars)

5\. \*\*Database Security\*\*

\- Parameterized queries (prevents SQL injection)

\- Connection pooling

\- SSL support for production

\### Production Recommendations

1\. \*\*Use JWT instead of Base64 tokens\*\* - More secure and industry standard

2\. \*\*Enable HTTPS\*\* - Always use TLS in production

3\. \*\*Set up CORS\*\* - Restrict cross-origin requests

4\. \*\*Use environment-specific configs\*\* - Different settings for dev/prod

5\. \*\*Monitor logs\*\* - Set up application logging and monitoring

6\. \*\*Database backups\*\* - Regular automated backups

7\. \*\*API versioning\*\* - Plan for API evolution

\---

\## 📝 Error Handling

All errors follow this format:

\`\`\`json

{

"error": "Error message",

"statusCode": 400

}

\`\`\`

Common status codes:

\- \`200\` - Success

\- \`201\` - Created

\- \`400\` - Bad Request

\- \`401\` - Unauthorized

\- \`403\` - Forbidden

\- \`404\` - Not Found

\- \`429\` - Too Many Requests (Rate Limited)

\- \`500\` - Internal Server Error

\---

\## 🤝 Contributing

1\. Fork the repository

2\. Create a feature branch (\`git checkout -b feature/amazing-feature\`)

3\. Commit your changes (\`git commit -m 'Add amazing feature'\`)

4\. Push to the branch (\`git push origin feature/amazing-feature\`)

5\. Open a Pull Request

\---

\## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

\---

\## 📧 Support

For questions or issues:

\- Create an issue on GitHub

\- Email: support@chatworld.example.com

\- Discord: \[Join our community\](https://discord.gg/chatworld)

\---

\## 🎯 Roadmap

\- \[x\] User authentication

\- \[x\] Profile management

\- \[x\] Letters/Messages

\- \[x\] Friendships system

\- \[x\] Rate limiting & security

\- \[ \] Stamps gamification

\- \[ \] Real-time notifications (WebSocket)

\- \[ \] File uploads

\- \[ \] Search functionality

\- \[ \] Admin panel

\---

\*\*Last Updated\*\*: January 2024

\*\*Version\*\*: 1.0.0