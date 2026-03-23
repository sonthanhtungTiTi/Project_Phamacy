# Client-Side Authentication System Analysis

## Overview
The pharmacy application implements a dual authentication system with separate flows for **client (customer)** and **admin** users. The client handles standard auth + OAuth Google integration, while admin has token refresh and role-based access control.

---

## 1. AUTH SERVICE / API CALLS

### CLIENT AUTH SERVICE
**File:** `frontend-client/src/services/auth.service.ts`

#### Login Functions
- `loginWithForm(loginPayload)` - Phone/Email + Password login
  - Endpoint: `POST /api/client/auth/login`
  - Payload: `{ phoneOrEmail: string; password: string }`
  - Returns: `{ accessToken, user: AuthUser }`

- `loginWithGoogle(idToken)` - Google OAuth ID token login
  - Endpoint: `POST /api/client/auth/google`
  - Payload: `{ idToken: string }`
  - Returns: `{ accessToken, user: AuthUser }`

- `loginWithGoogleCode(authCode, redirectUri)` - Google OAuth code exchange
  - Endpoint: `POST /api/client/auth/google/code`
  - Payload: `{ authCode: string; redirectUri: string }`
  - Returns: `{ accessToken, user: AuthUser }`

#### Registration
- `registerWithForm(registerPayload)` - Create new local account
  - Endpoint: `POST /api/client/auth/register`
  - Payload: `{ fullName, email, phone, password }`
  - Returns: `{ accessToken, user: AuthUser }`

#### Password Recovery Flow
- `forgotPassword(forgotPasswordPayload)` - Request OTP for password reset
  - Endpoint: `POST /api/client/auth/forgot-password`
  - Payload: `{ email: string }`
  - Returns: `{ maskedEmail: string; expiresInMinutes: number }`

- `verifyForgotPasswordOtp(verifyPayload)` - Verify OTP code
  - Endpoint: `POST /api/client/auth/forgot-password/verify-otp`
  - Payload: `{ email: string; otp: string }`
  - Returns: `{ verified: boolean }`

- `resetForgotPassword(resetPayload)` - Set new password after OTP verification
  - Endpoint: `POST /api/client/auth/forgot-password/reset`
  - Payload: `{ email: string; newPassword: string; confirmPassword: string }`
  - Returns: `{ reset: boolean }`

#### Profile Management
- `updateProfile(userId, profilePayload)` - Update user profile (requires auth token)
  - Endpoint: `PUT /api/client/auth/profile/{userId}`
  - Payload: `Partial<AuthUser>`
  - Headers: `Authorization: Bearer {accessToken}`
  - Returns: `{ user: AuthUser }`

---

### ADMIN AUTH SERVICE
**File:** `frontend-admin/src/services/auth.service.ts`

#### Login
- `login(payload)` - Admin login
  - Endpoint: `POST /api/admin/auth/login`
  - Payload: `{ email: string; password: string }`
  - Returns: `{ accessToken, refreshToken?, user, expiresIn }`

#### Logout
- `logout()` - Admin logout
  - Endpoint: `POST /api/admin/auth/logout`
  - Headers: `Authorization: Bearer {adminAccessToken}`

#### Token Management
- `refreshToken()` - Refresh expired admin access token
  - Endpoint: `POST /api/admin/auth/refresh`
  - Headers: `Authorization: Bearer {adminAccessToken}`
  - Returns: `{ accessToken, refreshToken?, user, expiresIn }`

#### User Info
- `getCurrentUser()` - Fetch current admin user profile
  - Endpoint: `GET /api/admin/auth/me`
  - Headers: `Authorization: Bearer {adminAccessToken}`
  - Returns: Admin user data

---

## 2. AUTH STORE & STATE MANAGEMENT

### CLIENT
**File:** `frontend-client/src/components/layout/layout.tsx`
- Uses **localStorage** directly (not a store library)
- Keys: `clientAccessToken`, `clientUser`
- State managed via `useState` in the layout component

### ADMIN
**File:** `frontend-admin/src/stores/authStore.ts`
- Uses **Zustand** store
- State properties:
  - `user: AdminUser | null`
  - `token: string | null`
  - `isAuthenticated: boolean`
  - `loading: boolean`
  - `error: string | null`

- Actions:
  - `login(credentials)` - Authenticate and populate state
  - `logout()` - Clear auth state and localStorage
  - `checkAuth()` - Verify existing token on app load
  - `clearError()` - Clear error messages

- Persistence: Saves `adminAccessToken` and `adminUser` to localStorage

---

## 3. PROTECTED ROUTES IMPLEMENTATION

### ADMIN Protected Routes
**File:** `frontend-admin/src/components/auth/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}
```

**Features:**
- Checks `isAuthenticated` and `user` from authStore
- Shows loading spinner while verifying auth
- Redirects to `/login` if not authenticated
- Supports role-based access control (requiredRole parameter)
- Redirects to `/unauthorized` if user lacks required role

**Usage in App.tsx:**
```typescript
<Route
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="orders" element={<OrdersPage />} />
  <Route path="inventory" element={<Inventory />} />
</Route>
```

### CLIENT
**File:** `frontend-client/src/App.tsx`
- **No explicit route protection** - uses modal-based auth
- Protected API calls check for token in `getAuthHeaders()` function
- Services throw error if token missing: "Vui long dang nhap de..."

---

## 4. LOGIN PAGE/FORM COMPONENTS

### CLIENT
**File:** `frontend-client/src/pages/LoginAndRegister.tsx`
- Modal dialog component with tabs: Login | Register | Forgot Password
- Features:
  - **Login mode**: Phone/Email + Password
  - **Register mode**: Name + Phone + Email + Password + Google option
  - **Forgot Password mode**: Uses OtpVerify component
  - Google OAuth login button
  - Form validation with error toasts
  - Password visibility toggle

**Flow:**
1. User enters credentials
2. Calls `loginWithForm()` or `registerWithForm()`
3. On success: Saves tokens to localStorage and calls `onAuthSuccess()`
4. Modal closes and user navigated to protected section

### ADMIN
**File:** `frontend-admin/src/pages/LoginPage.tsx`
**File:** `frontend-admin/src/components/auth/LoginForm.tsx`

- Full page login (not modal)
- Features:
  - Email + Password fields
  - "Remember Me" checkbox (saves email in localStorage)
  - Show/hide password toggle
  - Forgot Password link → `/forgot-password`
  - Inline field validation with error text under inputs
  - Displays auth errors from store
  - Loading state during submission

**Flow:**
1. Form validates email and password format
2. Calls `useAuthStore.login(credentials)`
3. On success: Redirects to `/dashboard`
4. Auth state persisted in localStorage

---

## 5. TOKEN STORAGE & RETRIEVAL

### CLIENT Tokens
**Storage Location:** Browser `localStorage`

| Key | Value | Set When |
|-----|-------|----------|
| `clientAccessToken` | JWT access token | After login/register |
| `clientUser` | JSON stringified user object | After login/register |

**Retrieval:**
```typescript
// auth.service.ts
const getAccessToken = () => localStorage.getItem('clientAccessToken') || ''
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken}`,
})
```

**Used by services:**
- `cart.service.ts`
- `order.service.ts`
- `address.service.ts`

### ADMIN Tokens
**Storage Location:** Browser `localStorage`

| Key | Value | Set When |
|-----|-------|----------|
| `adminAccessToken` | JWT access token (7d expiry) | After successful login |
| `adminUser` | JSON stringified admin user object | After successful login |
| `adminRememberMe` | User's email (if "Remember Me" checked) | After login with checkbox |

**Retrieval:**
```typescript
// order.service.ts (also used by admin)
const getAccessToken = () => 
  localStorage.getItem('adminAccessToken') || 
  localStorage.getItem('clientAccessToken') || ''
```

**Token Refresh:**
- Not implemented on client yet (backend supports `POST /admin/auth/refresh`)
- authStore.login() calls authService.refreshToken() but not auto-called on token expiry

---

## 6. AUTH MIDDLEWARE & INTERCEPTORS

### CLIENT
**No dedicated interceptor** - Manual token inclusion in each API call

Services implement local helper functions:
```typescript
const getAuthHeaders = () => {
  const accessToken = getAccessToken()
  if (!accessToken) throw new Error('Vui long dang nhap...')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  }
}
```

### ADMIN
**Files involved:**
- `frontend-admin/src/stores/authStore.ts` - checkAuth() on app load
- `frontend-admin/src/App.tsx` - useEffect calls checkAuth() on mount
- `frontend-admin/src/components/auth/ProtectedRoute.tsx` - Route-level guard

**Backend Authorization Middleware:**
`backend/src/middleware/auth.middleware.js`
- `authenticateClientJwt()` - Verifies JWT token from Authorization header
- `authorizeSelfOrAdmin()` - Checks if user is self or admin (for profile updates)
- Token format: `Bearer {token}`

---

## 7. OTP & SPECIAL AUTH FLOWS

### OTP Password Recovery Flow
**Component:** `frontend-client/src/components/ui/otp-verify.tsx`

**3-Step Flow:**

**Step 1: Email Input**
- User enters email
- Calls `forgotPassword({ email })`
- Backend generates 6-digit OTP (10 min expiry), sends via email
- Returns masked email (e.g., "u***@example.com") and expiry time

**Step 2: OTP Verification**
- User enters 6-digit OTP
- Calls `verifyForgotPasswordOtp({ email, otp })`
- Backend validates OTP against hash stored in DB
- Returns `{ verified: true }` on success

**Step 3: New Password Reset**
- User enters new password + confirm password
- Validates: Min 6 chars, contains letters and numbers
- Calls `resetForgotPassword({ email, newPassword, confirmPassword })`
- Backend updates password and clears OTP record
- Returns `{ reset: true }`

**Validation Rules:**
- Email: Must match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- OTP: Exactly 6 digits `/^[0-9]{6}$/`
- Password: 6+ chars with letters + numbers

### Google OAuth Flow

**Client Implementation:**
- Uses `@react-oauth/google` library
- `GoogleLogin` component from react-oauth/google
- On success: Returns `CredentialResponse` with `credential` (ID token)

**Flow:**
1. User clicks Google Login button
2. Google provides `idToken`
3. Send to `POST /api/client/auth/google` or `/api/client/auth/google/code`
4. Backend validates idToken with Google's library
5. Upserts user (creates if new, updates if exists)
6. Returns access token + user data

**Backend Logic** (`backend/src/services/client/auth.service.js`):
- Google-only account: Can only login via Google, cannot reset local password
- Google + local account: Can login both ways, can reset local password
- Error handling: "This account must login with Google" for Google-only accounts

---

## AUTHENTICATION FLOW SUMMARY

### Client User Flow
```
┌─────────────────────────────────────────────────────────┐
│                 Customer/Client Flow                     │
├─────────────────────────────────────────────────────────┤
│ 1. Open LoginAndRegister modal                           │
│ 2. Choose: Login | Register | Forgot Password            │
│                                                           │
│ LOGIN PATH:                                              │
│ ├─ Enter Phone/Email + Password                          │
│ ├─ Call loginWithForm()                                  │
│ ├─ Save clientAccessToken + clientUser to localStorage   │
│ └─ Navigate to protected section (cart, checkout, etc)   │
│                                                           │
│ REGISTER PATH:                                           │
│ ├─ Enter Name + Phone + Email + Password                 │
│ ├─ Call registerWithForm()                               │
│ ├─ Save tokens to localStorage                           │
│ └─ Navigate to protected section                         │
│                                                           │
│ FORGOT PASSWORD PATH:                                    │
│ ├─ Enter email → forgotPassword() → OTP sent (10 min)   │
│ ├─ Enter OTP → verifyForgotPasswordOtp()                │
│ ├─ Enter new password → resetForgotPassword()            │
│ └─ Redirect to login                                     │
│                                                           │
│ GOOGLE PATH:                                             │
│ ├─ Click Google button → Google popup                    │
│ ├─ Google returns idToken                                │
│ ├─ Call loginWithGoogle(idToken)                         │
│ └─ Save tokens + navigate                                │
└─────────────────────────────────────────────────────────┘
```

### Admin User Flow
```
┌──────────────────────────────────────────────────────────┐
│                   Admin User Flow                         │
├──────────────────────────────────────────────────────────┤
│ 1. Navigate to /login page                               │
│ 2. Enter Email + Password (+ optional "Remember Me")     │
│ 3. Call authStore.login(credentials)                     │
│ 4. Backend validates, returns accessToken + user        │
│ 5. Store saves to localStorage:                          │
│    ├─ adminAccessToken (JWT, 7d expiry)                 │
│    ├─ adminUser (JSON object)                           │
│    └─ adminRememberMe (if checked)                      │
│ 6. App calls authStore.checkAuth() on mount              │
│ 7. ProtectedRoute wraps /dashboard, /orders, /inventory  │
│ 8. Unauthenticated redirect to /login                    │
│ 9. On logout: Clear localStorage + redirects to /login   │
│ 10. Token refresh supported but not auto-implemented     │
└──────────────────────────────────────────────────────────┘
```

---

## KEY FILES REFERENCE

| Purpose | File Path |
|---------|-----------|
| **Client Auth Service** | `frontend-client/src/services/auth.service.ts` |
| **Client Login/Register Modal** | `frontend-client/src/pages/LoginAndRegister.tsx` |
| **Client OTP Verification** | `frontend-client/src/components/ui/otp-verify.tsx` |
| **Admin Auth Service** | `frontend-admin/src/services/auth.service.ts` |
| **Admin Auth Store (Zustand)** | `frontend-admin/src/stores/authStore.ts` |
| **Admin Auth Hook** | `frontend-admin/src/hooks/useAuth.ts` |
| **Admin Login Page** | `frontend-admin/src/pages/LoginPage.tsx` |
| **Admin Login Form** | `frontend-admin/src/components/auth/LoginForm.tsx` |
| **Admin Protected Route** | `frontend-admin/src/components/auth/ProtectedRoute.tsx` |
| **Admin App Routes** | `frontend-admin/src/App.tsx` |
| **Client App Routes** | `frontend-client/src/App.tsx` |
| **Backend Auth Middleware** | `backend/src/middleware/auth.middleware.js` |
| **Backend Auth Controller** | `backend/src/controllers/client/auth.controller.js` |
| **Backend Auth Service** | `backend/src/services/client/auth.service.js` |

---

## NOTES & OBSERVATIONS

### Strengths ✓
- Separate auth systems for client vs admin (good separation of concerns)
- OTP-based password recovery with email validation
- Google OAuth integration with account linking
- Zustand store for admin auth (scalable state management)
- Protected routes with role-based access control
- Token storage in localStorage
- Form validation with error messages

### Areas for Improvement ⚠️
- **Client** has no centralized auth store (direct localStorage access)
- **Auto token refresh** not implemented on client (token will expire after 7 days)
- **No request interceptor** - token must be manually added to each API call
- **No logout function** for client (manual localStorage cleanup)
- **URL-based routing** for client instead of router library (fragile)
- **No token expiry handling** - expired token will cause 401 errors
- **No refresh token** implementation for client
- **Order service** checks both `adminAccessToken` and `clientAccessToken` (confusing)

