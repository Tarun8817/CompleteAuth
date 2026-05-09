# JWT Authentication System API

A secure and scalable JWT Authentication API built with Node.js, Express.js, and MongoDB using access tokens, refresh tokens, session management, and token rotation.

---

# Features

## Authentication Features

- User Registration
- User Login
- Protected User Profile Route (`/me`)
- Refresh Token Authentication
- Logout from Current Device
- Logout from All Devices
- JWT-based Authentication
- Password Hashing using bcrypt
- Session-based Refresh Token Management

---

# Security Features

## Access Token + Refresh Token Strategy

This project uses:

- Short-lived Access Tokens → valid for `15 minutes`
- Long-lived Refresh Tokens → valid for `7 days`

This improves security because:

- Access tokens expire quickly
- Refresh tokens are stored securely in HTTP-only cookies
- Users remain logged in without repeatedly entering credentials

---

## Refresh Token Rotation

Every time a refresh token is used:

- A new refresh token is generated
- Old refresh token becomes invalid
- Session token hash is updated in database

This prevents:

- Token replay attacks
- Stolen refresh token reuse

---

## Session Management

Each login creates a new session document containing:

- User ID
- Hashed Refresh Token
- IP Address
- User Agent
- Revoked Status

This enables:

- Multi-device login support
- Logout from specific devices
- Logout from all devices
- Session revocation

---

## Refresh Token Hashing

Refresh tokens are never stored directly in the database.

Instead:

- Token is hashed using SHA-256
- Only hashed value is stored

This improves security in case the database is compromised.

---

## HTTP-Only Secure Cookies

Refresh tokens are stored in cookies with:

```js
httpOnly: true
secure: true
sameSite: "strict"
```

Benefits:

- Prevents JavaScript access to cookies
- Reduces XSS attack risk
- Helps prevent CSRF attacks

---

# Tech Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication & Security

- JWT
- bcrypt
- crypto
- cookie-parser

## Development Tools

- morgan
- dotenv

---

# Folder Structure

```bash
project/
│
├── config/
│   ├── config.js
│   └── db.js
│
├── controllers/
│   └── auth.controller.js
│
├── models/
│   ├── user.model.js
│   └── session.model.js
│
├── routes/
│   └── auth.routes.js
│
├── app.js
├── server.js
├── .env
├── package.json
└── README.md
```

---

# Environment Variables

Create a `.env` file in the root directory.

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=3000
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/your-repo.git
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

---

# API Endpoints

## Base URL

```bash
/api/auth
```

---

# 1. Register User

## Endpoint

```http
POST /api/auth/register
```

## Request Body

```json
{
  "username": "tarun",
  "email": "tarun@example.com",
  "password": "123456"
}
```

## Response

```json
{
  "message": "User created successfully",
  "user": {
    "username": "tarun",
    "email": "tarun@example.com"
  },
  "accessToken": "jwt_token"
}
```

---

# 2. Login User

## Endpoint

```http
POST /api/auth/login
```

## Request Body

```json
{
  "email": "tarun@example.com",
  "password": "123456"
}
```

---

# 3. Get Current User

## Endpoint

```http
GET /api/auth/me
```

## Headers

```http
Authorization: Bearer ACCESS_TOKEN
```

---

# 4. Refresh Access Token

## Endpoint

```http
POST /api/auth/refresh-token
```

## Cookie Required

```http
refreshToken
```

---

# 5. Logout Current Device

## Endpoint

```http
POST /api/auth/logout
```

---

# 6. Logout From All Devices

## Endpoint

```http
POST /api/auth/logout-all
```

---

# Database Models

## User Model

```js
{
  username: String,
  email: String,
  password: String
}
```

---

## Session Model

```js
{
  user: ObjectId,
  refreshTokenHash: String,
  ip: String,
  userAgent: String,
  revoked: Boolean
}
```

---

# Authentication Flow

## Login Flow

1. User logs in
2. Password is verified
3. Refresh token is generated
4. Refresh token hash is stored in database
5. Access token is returned
6. Refresh token stored in HTTP-only cookie

---

## Protected Route Flow

1. Access token sent in Authorization header
2. JWT token verified
3. Session validated
4. User data returned

---

## Refresh Token Flow

1. Refresh token read from cookies
2. JWT verified
3. Token hash matched with database
4. New refresh token generated
5. Session updated
6. New access token returned

---

# Security Best Practices Implemented

- Password hashing with bcrypt
- Refresh token hashing
- Refresh token rotation
- HTTP-only cookies
- Session validation
- Session revocation
- JWT expiration handling
- Environment variable validation

---

# Suggested Improvements

You can further improve this project by adding:

- Email Verification
- Forgot Password Feature
- Rate Limiting
- Helmet.js Security Headers
- Role-based Authorization
- OAuth Login (Google/GitHub)
- Redis Session Storage
- Access Token Blacklisting
- API Validation using Joi/Zod
- Unit & Integration Testing

---

# Dependencies Used

```json
{
  "bcrypt": "^5.x",
  "cookie-parser": "^1.x",
  "crypto": "built-in",
  "dotenv": "^16.x",
  "express": "^4.x",
  "jsonwebtoken": "^9.x",
  "mongoose": "^8.x",
  "morgan": "^1.x"
}
```

---

# Author

Developed by Tarun Rajput

---

# License

This project is licensed under the MIT License.
