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

        {/* Default route - redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch All - redirect to dashboard (will be caught by ProtectedRoute) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
