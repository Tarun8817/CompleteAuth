# CompleteAuth Backend Documentation

## Project Structure

- **server.js**: Entry point. Starts the server and connects to MongoDB.
- **package.json**: Project dependencies and scripts.
- **src/**: Main source folder
  - **app.js**: Express app setup, middleware, and routes.
  - **config/**
    - **config.js**: Loads environment variables and exports config object.
    - **database.js**: MongoDB connection logic.
  - **controllers/**
    - **auth.controller.js**: All authentication logic (register, login, verify email, token management, logout).
  - **models/**
    - **user.model.js**: User schema (username, email, password, verified).
    - **otp.model.js**: OTP schema (email, otp, expiresAt).
    - **session.model.js**: Session schema (user, refreshTokenHash, ip, userAgent, revoked).
  - **routes/**
    - **auth.routes.js**: Auth API endpoints and route definitions.
  - **services/**
    - **email.service.js**: Email sending logic using nodemailer.
  - **utils/**
    - **utils.js**: Utility functions (OTP generation, HTML template).

## How to Implement

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up your .env file**
   - Copy all required keys from `src/config/config.js` (MONGO_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_USER).

3. **Start the server**
   ```bash
   npm start
   ```

4. **API Endpoints & cURL Examples**

### Register
```
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Verify Email (OTP)
```
curl -X POST http://localhost:3001/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### Login
```
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Get Current User (Authenticated)
```
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Refresh Token
```
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -b cookies.txt
```

### Logout
```
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

### Logout All Sessions
```
curl -X POST http://localhost:3001/api/auth/logout-all \
  -b cookies.txt
```

## Folder/File Purpose

- **config/**: Configuration and DB connection.
- **controllers/**: Business logic for authentication.
- **models/**: Mongoose schemas for MongoDB collections.
- **routes/**: API endpoint definitions.
- **services/**: External services (email).
- **utils/**: Helper functions.

## Adding New Features
- Add new routes in `routes/` and controllers in `controllers/`.
- Add new models in `models/` as needed.
- Use services for external integrations.

---

**This documentation covers all endpoints, folder structure, and implementation steps.**
