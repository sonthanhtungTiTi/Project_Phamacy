import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-20 bg-white border-b border-card-border flex items-center justify-between px-6 shrink-0 z-10 w-full">
      {/* Search Bar */}
      <div className="flex-1 max-w-[600px]">
        <div className="relative flex items-center">
          <i className="fa-solid fa-magnifying-glass absolute left-4 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng, khách hàng..."
            className="w-full bg-gray-50 border-none rounded-md py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-gray-400 transition-shadow"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-4">
        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
            <i className="fa-solid fa-bell text-lg"></i>
            {/* Notification Dot */}
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full border border-white"></span>
          </button>
          <button className="text-gray-500 hover:text-gray-700 transition-colors">
            <i className="fa-solid fa-gear text-lg"></i>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
              </p>
            </div>
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName || 'User'}`}
              alt="User profile"
              className="w-10 h-10 rounded-md border border-gray-200 bg-gray-50 object-cover"
            />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-user text-gray-400"></i>
                Tài khoản
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-sliders text-gray-400"></i>
                Cài đặt
              </a>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
