# Email-Based Authentication API Endpoints

## SYSTEM 1: Original Routes (Now with OTP & Forgot Password)

### LOGIN
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
Returns: `accessToken`, `refreshToken`, `token`, `user`

### FORGOT PASSWORD - Step 1: Request OTP
**POST** `/api/auth/forgot-password`
```json
{
  "email": "user@example.com"
}
```

### FORGOT PASSWORD - Step 2: Verify OTP
**POST** `/api/auth/forgot-password/verify`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### FORGOT PASSWORD - Step 3: Reset Password
**POST** `/api/auth/reset-password`
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newsecurepassword123"
}
```

### Token Management
**POST** `/api/auth/verify-token`
```json
{
  "token": "jwt_token"
}
```

**POST** `/api/auth/refresh-token`
```json
{
  "token": "jwt_refresh_token"
}
```

---

## SYSTEM 2: Complete OTP-Based Routes (Alternative)

### SIGNUP - Step 1: Request OTP
**POST** `/api/auth/otp/signup-request-otp`
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### SIGNUP - Step 2: Verify OTP & Create Account
**POST** `/api/auth/otp/signup-verify-otp`
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "username": "username",
  "preferences": ["Gaming", "Music"]
}
```

### LOGIN
**POST** `/api/auth/otp/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### FORGOT PASSWORD - Step 1: Request OTP
**POST** `/api/auth/otp/forgot-password`
```json
{
  "email": "user@example.com"
}
```

### FORGOT PASSWORD - Step 2: Verify OTP
**POST** `/api/auth/otp/forgot-password/verify`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### FORGOT PASSWORD - Step 3: Reset Password
**POST** `/api/auth/otp/reset-password`
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newsecurepassword123"
}
```

### Token Management
**POST** `/api/auth/otp/verify-token`
```json
{
  "token": "jwt_token"
}
```

**POST** `/api/auth/otp/refresh-token`
```json
{
  "token": "jwt_refresh_token"
}
```

## ERROR RESPONSES

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common error messages:
- "User already exists"
- "Email required"
- "Password required"
- "Invalid credentials"
- "Invalid or expired OTP"
- "User not found"
- "Account not verified"
- "Too many failed attempts. Please request a new OTP"

## ENVIRONMENT VARIABLES REQUIRED

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `RESEND_API_KEY` - Resend email service API key
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## FEATURES

✓ Email verification with OTP (6 digits, 10 min expiry)
✓ Password hashing with bcryptjs
✓ JWT tokens (1h access, 7d refresh)
✓ OTP rate limiting (5 attempts max per request)
✓ Automatic OTP cleanup on expiry
✓ Forgot password flow with OTP verification
✓ Email sent via Resend service
✓ Brute force protection for OTP attempts
