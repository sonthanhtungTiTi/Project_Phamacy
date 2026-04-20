import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faCapsules,
  faChartLine,
  faChartPie,
  faFileInvoice,
  faGear,
  faPills,
  faRightFromBracket,
  faUsers,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons'
import { useAuthStore } from '../../stores/authStore'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems: Array<{ label: string; icon: IconDefinition; path: string }> = [
    { label: 'Dashboard', icon: faChartLine, path: '/dashboard' },
    { label: 'Đơn Hàng', icon: faFileInvoice, path: '/orders' },
    { label: 'Sản Phẩm', icon: faPills, path: '/products' },
    { label: 'Kho Hàng', icon: faWarehouse, path: '/inventory' },
    { label: 'Người Dùng', icon: faUsers, path: '/customers' },
    { label: 'Báo Cáo', icon: faChartPie, path: '/reports' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <FontAwesomeIcon icon={faCapsules} className="text-lg" />
            <span>Clinical Azure</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">PHARMACY ADMIN</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-blue-50'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-20 bg-white shadow-sm border-b flex items-center justify-between px-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng, khách hàng..."
              className="w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <button className="relative text-gray-500 hover:text-gray-700">
              <FontAwesomeIcon icon={faBell} className="text-lg" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="text-gray-500 hover:text-gray-700 text-xl">
              <FontAwesomeIcon icon={faGear} />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <img
                  src="https://via.placeholder.com/40"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cài đặt
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
