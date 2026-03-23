import { NavLink, Link } from 'react-router-dom';

export default function Sidebar() {
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-shapes' },
    { name: 'Orders', path: '/orders', icon: 'fa-solid fa-cart-shopping' },
    { name: 'Inventory', path: '/inventory', icon: 'fa-solid fa-box-open' },
    { name: 'Customers', path: '/customers', icon: 'fa-solid fa-user-group' },
    { name: 'Reports', path: '/reports', icon: 'fa-solid fa-chart-column' },
  ];

  return (
    <aside className="w-[260px] min-w-[260px] bg-white border-r border-card-border flex flex-col h-full z-20 shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center shrink-0">
          <i className="fa-solid fa-briefcase-medical text-sm"></i>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg text-primary leading-tight">Clinical Azure</span>
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Pharmacy Admin</span>
        </div>
      </div>

      {/* Primary Action */}
      <div className="p-5 shrink-0">
        <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm">
          <i className="fa-solid fa-plus text-sm"></i>
          New Prescription
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-[15px] font-medium ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-sidebar-hover hover:text-gray-900'
              }`
            }
          >
             {({ isActive }) => (
                <>
                  <div className={`w-5 flex justify-center ${isActive ? 'text-primary' : 'text-gray-400'}`}>
                    <i className={link.icon}></i>
                  </div>
                  {link.name}
                </>
             )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1 shrink-0">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-gray-600 hover:bg-sidebar-hover hover:text-gray-900 rounded-md transition-colors text-left">
          <div className="w-5 flex justify-center text-gray-400">
             <i className="fa-regular fa-circle-question"></i>
          </div>
          Support
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-gray-600 hover:bg-sidebar-hover hover:text-gray-900 rounded-md transition-colors text-left">
          <div className="w-5 flex justify-center text-gray-400">
             <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
}
