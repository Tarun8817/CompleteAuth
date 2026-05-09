# CompleteAuth Backend

> A production-ready authentication backend with JWT, refresh tokens, OTP email verification, and multi-session management — built with Node.js, Express, and MongoDB.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Register](#post-apiauthregister)
  - [Verify Email](#post-apiauthverify-email)
  - [Login](#post-apiauthlogin)
  - [Get Current User](#get-apiauthme)
  - [Refresh Token](#post-apiauthrefresh-token)
  - [Logout](#post-apiauthlogout)
  - [Logout All Sessions](#post-apiauthlogout-all)
- [Architecture Overview](#architecture-overview)
- [Adding New Features](#adding-new-features)

---

## Features

- **User Registration** with email OTP verification
- **JWT Access Tokens** (short-lived) + **Refresh Tokens** (long-lived, httpOnly cookie)
- **Multi-session management** — track sessions per device/IP
- **Logout single session** or **revoke all sessions** at once
- **Refresh token hashing** — raw tokens never stored in DB
- **Google OAuth** via Nodemailer for sending OTP emails
- **Modular architecture** — controllers, services, models cleanly separated

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer + Google OAuth2 |
| Environment | dotenv |

---

## Project Structure

```
completeauth-backend/
├── server.js                  # Entry point — starts server, connects MongoDB
├── package.json
└── src/
    ├── app.js                 # Express setup, middleware, route mounting
    ├── config/
    │   ├── config.js          # Loads & exports all environment variables
    │   └── database.js        # MongoDB connection logic
    ├── controllers/
    │   └── auth.controller.js # Core auth logic (register, login, OTP, tokens, logout)
    ├── models/
    │   ├── user.model.js      # User schema (username, email, password, verified)
    │   ├── otp.model.js       # OTP schema (email, otp, expiresAt)
    │   └── session.model.js   # Session schema (user, refreshTokenHash, ip, userAgent, revoked)
    ├── routes/
    │   └── auth.routes.js     # Auth route definitions
    ├── services/
    │   └── email.service.js   # Email sending via Nodemailer
    └── utils/
        └── utils.js           # OTP generation, HTML email templates
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A Google account for OAuth email sending

### Installation

```bash
git clone https://github.com/your-username/completeauth-backend.git
cd completeauth-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory. All required keys are defined in `src/config/config.js`:

```env
# Server
PORT=3001

# MongoDB
MONGO_URI=mongodb://localhost:27017/completeauth

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth (for Nodemailer email sending)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
GOOGLE_USER=your_gmail_address@gmail.com
```

> **How to get Google OAuth credentials:**
> Go to [Google Cloud Console](https://console.cloud.google.com/) → Create OAuth 2.0 credentials → Use [OAuth Playground](https://developers.google.com/oauthplayground) to generate a refresh token with the `https://mail.google.com/` scope.

### Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3001` by default.

---

## API Reference

Base URL: `http://localhost:3001/api/auth`

---

### POST `/api/auth/register`

Registers a new user and sends an OTP to their email for verification.

**Request Body**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response** `201 Created`

```json
{
  "message": "Registration successful. Please verify your email."
}
```

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

---

### POST `/api/auth/verify-email`

Verifies the user's email using the OTP sent during registration.

**Request Body**

```json
{
  "email": "test@example.com",
  "otp": "123456"
}
```

**Response** `200 OK`

```json
{
  "message": "Email verified successfully."
}
```

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

---

### POST `/api/auth/login`

Authenticates the user. Returns a JWT access token and sets a `refreshToken` httpOnly cookie.

**Request Body**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response** `200 OK`

```json
{
  "accessToken": "<JWT_ACCESS_TOKEN>",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

> Refresh token is set as an httpOnly cookie — not exposed in the response body.

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

---

### GET `/api/auth/me`

Returns the currently authenticated user's profile. Requires a valid access token.

**Headers**

```
Authorization: Bearer <ACCESS_TOKEN>
```

**Response** `200 OK`

```json
{
  "id": "...",
  "username": "testuser",
  "email": "test@example.com",
  "verified": true
}
```

**cURL**

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

### POST `/api/auth/refresh-token`

Issues a new access token using the refresh token stored in the cookie.

**Cookie Required:** `refreshToken`

**Response** `200 OK`

```json
{
  "accessToken": "<NEW_JWT_ACCESS_TOKEN>"
}
```

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -b cookies.txt
```

---

### POST `/api/auth/logout`

Revokes the current session and clears the refresh token cookie.

**Cookie Required:** `refreshToken`

**Response** `200 OK`

```json
{
  "message": "Logged out successfully."
}
```

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

### POST `/api/auth/logout-all`

Revokes **all active sessions** for the authenticated user across all devices.

**Cookie Required:** `refreshToken`

**Response** `200 OK`

```json
{
  "message": "All sessions logged out."
}
```

**cURL**

```bash
curl -X POST http://localhost:3001/api/auth/logout-all \
  -b cookies.txt
```

---

## Architecture Overview

```
Request
  │
  ▼
auth.routes.js       ← Route definitions & middleware
  │
  ▼
auth.controller.js   ← Business logic (validate, query, respond)
  │
  ├──▶ user.model.js      ← User data
  ├──▶ otp.model.js       ← OTP storage with expiry
  ├──▶ session.model.js   ← Refresh token sessions
  │
  ├──▶ email.service.js   ← Send OTP via Gmail OAuth
  └──▶ utils.js           ← OTP generator, email HTML template
```

**Token Flow:**

1. Login → server issues short-lived `accessToken` (response body) + long-lived `refreshToken` (httpOnly cookie)
2. Access protected routes → send `Authorization: Bearer <accessToken>`
3. Access token expires → call `/refresh-token` with the cookie to get a new one
4. Logout → refresh token session is revoked in DB, cookie is cleared

**Security notes:**
- Refresh tokens are **hashed (SHA-256)** before storing in MongoDB — raw token is never saved
- Sessions track `ip` and `userAgent` for audit purposes
- OTPs have a TTL via `expiresAt` field and are deleted post-verification

---

## Adding New Features

1. **New route** → add to `src/routes/auth.routes.js`
2. **New business logic** → add handler in `src/controllers/auth.controller.js` (or create a new controller)
3. **New DB collection** → add Mongoose schema in `src/models/`
4. **New external service** → add to `src/services/`
5. **New config key** → add to `.env` and export from `src/config/config.js`

---

> Built with care for security, scalability, and clean code.
