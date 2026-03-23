# 🔐 ADMIN LOGIN SYSTEM - FILE GUIDE

## 📋 TÓRTẮT CÁC FILE CẦN TẠO

Để xây dựng giao diện đăng nhập Admin, cần tạo **9 file**:

| # | File Path | Mục đích | Dòng |
|---|-----------|---------|------|
| 1 | `src/types/auth.ts` | Định nghĩa interfaces (LoginCredentials, User...) | 40 |
| 2 | `src/services/auth.service.ts` | Gọi API login, logout, refresh token | 60 |
| 3 | `src/stores/authStore.ts` | Zustand store (user, token, loading...) | 120 |
| 4 | `src/hooks/useAuth.ts` | Hook logic đăng nhập/đăng xuất | 50 |
| 5 | `src/components/auth/LoginForm.tsx` | Form nhập email/password | 100 |
| 6 | `src/components/auth/OtpForm.tsx` | Form nhập OTP (nếu cần) | 80 |
| 7 | `src/components/auth/ProtectedRoute.tsx` | Wrapper bảo vệ routes | 40 |
| 8 | `src/pages/LoginPage.tsx` | Trang login chính | 100 |
| 9 | `src/App.tsx` | Cập nhật routing + protected routes | Sửa |

---

## 🔄 FLOW ĐĂNG NHẬP

```
User vào /login
      ↓
LoginPage render → LoginForm
      ↓
User nhập email + password → Click "Đăng nhập"
      ↓
useAuth hook → handleLogin()
      ↓
authService.login() → API: POST /api/admin/auth/login
      ↓
Backend verify → trả token + user info
      ↓
Zustand store lưu token + user
      ↓
localStorage.setItem('adminAccessToken', token)
      ↓
Redirect to /dashboard
      ↓
ProtectedRoute kiểm tra token → Allow access
      ↓
AdminLayout + Pages render
```

---

## 🛠️ CHI TIẾT CÁC FILE

### 1️⃣ TYPE DEFINITIONS

**File: `src/types/auth.ts`**

```typescript
export interface LoginCredentials {
  email: string
  password: string
}

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'manager' | 'staff'
  avatar?: string
  permissions: string[]
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
    refreshToken?: string
    user: AdminUser
    expiresIn: number
  }
}

export interface OtpVerifyRequest {
  email: string
  otp: string
}

export interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}
```

---

### 2️⃣ API SERVICE

**File: `src/services/auth.service.ts`**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    accessToken: string
    refreshToken?: string
    user: {
      id: string
      email: string
      fullName: string
      role: string
      avatar?: string
      permissions: string[]
    }
    expiresIn: number
  }
}

const authService = {
  // Login
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Đăng nhập thất bại')
    }
    
    return response.json()
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('adminAccessToken')
    if (token) {
      await fetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
    }
  },

  // Refresh Token
  refreshToken: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem('adminAccessToken')
    const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Token refresh failed')
    }
    
    return response.json()
  },

  // Get Current User
  getCurrentUser: async () => {
    const token = localStorage.getItem('adminAccessToken')
    const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }
    
    return response.json()
  },
}

export default authService
```

---

### 3️⃣ ZUSTAND STORE

**File: `src/stores/authStore.ts`**

```typescript
import { create } from 'zustand'
import { AdminUser } from '../types/auth'
import authService, { LoginPayload, AuthResponse } from '../services/auth.service'

interface AuthState {
  // State
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedToken = localStorage.getItem('adminAccessToken')
  const savedUser = localStorage.getItem('adminUser')

  return {
    // Initial State
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,

    // Actions
    login: async (credentials: LoginPayload) => {
      set({ loading: true, error: null })
      try {
        const response: AuthResponse = await authService.login(credentials)
        
        if (response.data) {
          const { accessToken, user } = response.data
          
          // Save to localStorage
          localStorage.setItem('adminAccessToken', accessToken)
          localStorage.setItem('adminUser', JSON.stringify(user))
          
          set({
            token: accessToken,
            user: user as AdminUser,
            isAuthenticated: true,
            loading: false,
          })
        }
      } catch (error: any) {
        set({
          error: error.message || 'Đăng nhập thất bại',
          loading: false,
        })
        throw error
      }
    },

    logout: async () => {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminUser')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      }
    },

    checkAuth: async () => {
      const token = localStorage.getItem('adminAccessToken')
      if (!token) {
        set({ isAuthenticated: false })
        return
      }

      set({ loading: true })
      try {
        const response = await authService.getCurrentUser()
        if (response.data) {
          set({
            user: response.data as AdminUser,
            token,
            isAuthenticated: true,
            loading: false,
          })
        }
      } catch (error) {
        localStorage.removeItem('adminAccessToken')
        localStorage.removeItem('adminUser')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        })
      }
    },

    clearError: () => set({ error: null }),
  }
})
```

---

### 4️⃣ CUSTOM HOOK

**File: `src/hooks/useAuth.ts`**

```typescript
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { LoginCredentials } from '../types/auth'

export const useAuth = () => {
  const { user, token, isAuthenticated, loading, error, login, logout, clearError } = useAuthStore()
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleLogin = async (credentials: LoginCredentials) => {
    // Validate
    const errors: Record<string, string> = {}
    if (!credentials.email) errors.email = 'Email là bắt buộc'
    if (!credentials.password) errors.password = 'Mật khẩu là bắt buộc'
    
    if (!credentials.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Email không hợp lệ'
    }
    
    if (credentials.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors({})
    
    try {
      await login(credentials)
      return true
    } catch (error) {
      return false
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    validationErrors,

    // Actions
    login: handleLogin,
    logout: handleLogout,
    clearError,
    setValidationErrors,
  }
}
```

---

### 5️⃣ LOGIN FORM COMPONENT

**File: `src/components/auth/LoginForm.tsx`**

```typescript
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login, loading, error, validationErrors, setValidationErrors, clearError } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error on change
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await login(formData)
    if (success) {
      if (rememberMe) {
        localStorage.setItem('adminRememberMe', formData.email)
      }
      navigate('/dashboard')
    }
  }

  // Auto-fill email if remembered
  React.useEffect(() => {
    const remembered = localStorage.getItem('adminRememberMe')
    if (remembered) {
      setFormData((prev) => ({
        ...prev,
        email: remembered,
      }))
      setRememberMe(true)
    }
  }, [])

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💊 Pharmacy Admin
        </h1>
        <p className="text-gray-600">Đăng nhập vào bảng điều khiển quản trị</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5"></i>
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            📧 Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="admin@pharmacy.com"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
              validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 font-medium">{validationErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              🔐 Mật khẩu
            </label>
            <a href="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium">
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <i className={`fa-solid fa-eye${!showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 font-medium">{validationErrors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary accent-primary cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
            Ghi nhớ địa chỉ email
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Đang đăng nhập...
            </>
          ) : (
            <>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              Đăng nhập
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>
          © 2024 Pharmacy Management System
          <br />
          <span className="text-xs">v1.0.0</span>
        </p>
      </div>
    </div>
  )
}
```

---

### 6️⃣ PROTECTED ROUTE COMPONENT

**File: `src/components/auth/ProtectedRoute.tsx`**

```typescript
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuthStore()

  // Still loading auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Đang xác thực...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

---

### 7️⃣ LOGIN PAGE

**File: `src/pages/LoginPage.tsx`**

```typescript
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <LoginForm />
        </div>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Gặp vấn đề?{' '}
          <a href="/support" className="text-primary hover:text-primary-dark font-semibold">
            Liên hệ hỗ trợ
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

### 8️⃣ CẬP NHẬT APP.TSX

**File: `src/App.tsx`** (Sửa)

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/dashboard'
import OrdersPage from './pages/OrdersPage'
import Inventory from './pages/inventory'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuthStore } from './stores/authStore'
import './App.css'

function App() {
  const { checkAuth } = useAuthStore()

  // Check auth on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

## 🎯 SUMMARY - CÁC FILE CẦN TẠO

1. ✅ `src/types/auth.ts` - Auth types
2. ✅ `src/services/auth.service.ts` - API service
3. ✅ `src/stores/authStore.ts` - Zustand store
4. ✅ `src/hooks/useAuth.ts` - Custom hook
5. ✅ `src/components/auth/LoginForm.tsx` - Form component
6. ✅ `src/components/auth/ProtectedRoute.tsx` - Route protection
7. ✅ `src/pages/LoginPage.tsx` - Login page
8. ✅ `src/App.tsx` - Update routing

---

## 🚀 GIAO DIỆN LOGIN CÓ

✅ Email input + validation  
✅ Password input + show/hide toggle  
✅ "Quên mật khẩu?" link  
✅ "Ghi nhớ email" checkbox  
✅ Responsive design  
✅ Loading state  
✅ Error messages  
✅ Gradient background  
✅ Icons (FontAwesome)  

---

## ⚙️ LƯU Ý

1. **API Endpoint**: `/api/admin/auth/login`
   - Nếu khác, sửa trong `auth.service.ts`

2. **Token Storage**: `adminAccessToken`
   - Backend phải trả về token có tên này

3. **Protected Routes**: 
   - Tất cả routes ngoài `/login` được bảo vệ
   - Tự động redirect to `/login` nếu chưa auth

4. **Remember Me**: 
   - Lưu email vào localStorage
   - Hiển thị lại khi quay lại login page

---

**Hãy tạo các file này và test đăng nhập admin!** 🔐
