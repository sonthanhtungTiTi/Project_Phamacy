# 🔐 ADMIN AUTH FLOW UPDATE - Theo Client Pattern

## 📋 HIỆN TẠI (Admin)
- ✓ Zustand store (authStore.ts)
- ✓ Custom hook (useAuth.ts)
- ✓ Login form component (LoginForm.tsx)
- ✓ Protected routes (ProtectedRoute.tsx)
- ✓ Login page (LoginPage.tsx)

## 🎯 MUỐN THAY ĐỔI (Thera Client)
- ❌ Não show login page ngay - chỉ backend
- ⚠️ Backend chạy, API ready nhưng frontend chưa render giao diện
- ⚠️ Chỉ chuẩn bị cơ chế auth (token, localStorage, service)

---

## 📊 SO SÁNH

| Aspect | Client | Admin (Current) | Admin (New) |
|--------|--------|-----------------|-------------|
| **Store** | localStorage only | Zustand | Zustand |
| **Auth Service** | fetch API | fetch API | fetch API |
| **Login Component** | Modal in HomePage | Separate LoginPage | Hidden/Pending |
| **Route Protection** | Check localStorage | ProtectedRoute | Hidden |
| **Token Key** | `clientAccessToken` | `adminAccessToken` | SAME ✓ |
| **Forgot Password** | OTP flow | Simple link | OTP flow |
| **State Management** | Direct localStorage | Zustand store | SAME ✓ |

---

## 🔄 FLOW ARCHITECTURE

### Current Admin Flow
```
App.tsx
  ↓
useAuthStore.checkAuth() → read localStorage →set state
  ↓
Route /login or /dashboard (based on token)
  ↓
LoginPage (show form)
  ↓
LoginForm → handleSubmit → authService.login()
  ↓
POST /api/admin/auth/login
  ↓
Backend verify → return token + user
  ↓
Store in localStorage + Zustand
  ↓
Auto redirect /dashboard
```

### New Flow (Chưa đẩy frontend, chỉ backend ready)
```
Giữ nguyên cơ chế ✓
Nhưng:
- Không render LoginPage (chỉ backend ready)
- API endpoint `/api/admin/auth/login` sẵn sàng
- Token mechanism sẵn sàng
- Services sẵn sàng
- Chỉ pending frontend UI
```

---

## ✅ CÓ GÌ CẦN LÀM

### 1️⃣ **Giữ nguyên hiện tại**
- ✓ authStore.ts (Zustand)
- ✓ auth.service.ts (API calls)
- ✓ useAuth.ts (hook)
- ✓ ProtectedRoute.tsx

### 2️⃣ **Chuyên OTP flow** (Giống client)
Client có:
```
forgotPassword() → GET maskedEmail + expiresInMinutes
  ↓
verifyOtp() → POST email + otp
  ↓
resetPassword() → POST email + newPassword
```

Admin cần thêm:
```
src/services/auth.service.ts - Add:
  - forgotPassword(email)
  - verifyOtpReset(email, otp)
  - resetPassword(email, newPassword)

src/types/auth.ts - Add:
  - ForgotPasswordRequest
  - VerifyOtpRequest
  - ResetPasswordRequest
```

### 3️⃣ **Giữ Login Page ẩn** (Chưa show)
- Để LoginPage.tsx as-is
- Nhưng route /login vẫn hoạt động
- Just don't promote it / không show link

### 4️⃣ **Token Auto Refresh** (Giống client)
Client chưa có auto-refresh
Admin có API refresh nhưng chưa dùng

Thêm:
```typescript
// auto-refresh token when expires
setInterval(() => {
  if (isAuthenticated && token) {
    checkTokenExpiry() // if expired → refreshToken()
  }
}, 5 * 60 * 1000) // check every 5 min
```

---

## 📝 CÁC FILE CẦN SỬA

### 1. `src/types/auth.ts` - Thêm OTP types
```typescript
export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  data?: {
    maskedEmail: string
    expiresInMinutes: number
  }
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResetPasswordRequest {
  email: string
  newPassword: string
  confirmPassword: string
}
```

### 2. `src/services/auth.service.ts` - Thêm OTP functions
```typescript
forgotPassword: async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return response.json()
}

verifyOtp: async (email: string, otp: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })
  return response.json()
}

resetPassword: async (email: string, newPassword: string, confirmPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword, confirmPassword }),
  })
  return response.json()
}
```

### 3. `src/stores/authStore.ts` - Thêm OTP actions
```typescript
forgotPassword: async (email: string) => { ... }
verifyOtp: async (email: string, otp: string) => { ... }
resetPassword: async (email: string, pwd: string, confirm: string) => { ... }
```

### 4. `src/components/auth/LoginForm.tsx` - Link "Quên mật khẩu?"
```typescript
// Giữ nguyên hoặc thêm logic OTP flow
```

---

## 🔐 API ENDPOINTS CẦN CÓ (Backend)

```
# Login
POST /api/admin/auth/login
  Body: { email, password }
  Response: { accessToken, user }

# Forgot Password
POST /api/admin/auth/forgot-password
  Body: { email }
  Response: { maskedEmail, expiresInMinutes }

# Verify OTP
POST /api/admin/auth/forgot-password/verify-otp
  Body: { email, otp }
  Response: { verified: true }

# Reset Password
POST /api/admin/auth/forgot-password/reset
  Body: { email, newPassword, confirmPassword }
  Response: { reset: true }

# Current User
GET /api/admin/auth/me
  Headers: { Authorization: Bearer TOKEN }
  Response: { user: {...} }

# Refresh Token
POST /api/admin/auth/refresh
  Headers: { Authorization: Bearer TOKEN }
  Response: { accessToken, user }

# Logout
POST /api/admin/auth/logout
  Headers: { Authorization: Bearer TOKEN }
```

---

## 🎯 FINAL STATE

```
Backend ✓ (API ready)
├─ POST /api/admin/auth/login
├─ POST /api/admin/auth/forgot-password
├─ POST /api/admin/auth/forgot-password/verify-otp
├─ POST /api/admin/auth/forgot-password/reset
├─ GET  /api/admin/auth/me
├─ POST /api/admin/auth/refresh
└─ POST /api/admin/auth/logout

Frontend ✓ (Cơ chế ready)
├─ src/types/auth.ts ✓
├─ src/services/auth.service.ts ✓
├─ src/stores/authStore.ts ✓
├─ src/hooks/useAuth.ts ✓
├─ src/components/auth/LoginForm.tsx ✓
├─ src/components/auth/ProtectedRoute.tsx ✓
├─ src/pages/LoginPage.tsx ✓
└─ src/App.tsx ✓

UI (Pending / Chưa show)
├─ LoginPage - Ready nhưng không promote
├─ Forgot Password Flow - Ready nhưng chưa UI
└─ OTP Verification - Ready nhưng chưa UI
```

---

## 📌 STATUS

- **Auth Mechanism**: ✅ READY
- **Token Storage**: ✅ READY
- **API Services**: ✅ READY (Basic login)
- **State Management**: ✅ READY
- **Route Protection**: ✅ READY
- **Forgot Password**: 🟡 PARTIAL (Need OTP flow)
- **UI Components**: ✅ READY (LoginForm, LoginPage)
- **Frontend Integration**: 🟡 PENDING (UI not visible yet)

---

**Next:** Thêm OTP flow vào auth service + store, rồi test backend API.
