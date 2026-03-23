import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Dashboard Overview</h1>
          <p className="text-gray-500 text-[15px]">Real-time monitoring of pharmacy performance and operations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
            <i className="fa-regular fa-calendar-days text-gray-400"></i>
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-dark transition-colors shadow-sm text-sm">
            <i className="fa-solid fa-download"></i>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-l-primary shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-3xl font-bold text-gray-800">1,284</h2>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-success flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up text-xs"></i>
            12% from last month
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-l-success shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Revenue</p>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-3xl font-bold text-gray-800">$42,850</h2>
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <i className="fa-solid fa-money-bill-wave"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-success flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up text-xs"></i>
            8.4% from last month
          </p>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">New Customers</p>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-3xl font-bold text-gray-800">156</h2>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
              <i className="fa-solid fa-user-plus"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
            <span className="w-2 h-0.5 bg-gray-400 inline-block rounded"></span>
            Stable growth
          </p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-5 border-l-4 border-l-warning shadow-sm relative overflow-hidden">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pending Orders</p>
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-3xl font-bold text-gray-800">23</h2>
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
          </div>
          <p className="text-sm font-medium text-danger flex items-center gap-1">
             <i className="fa-solid fa-triangle-exclamation text-xs"></i>
            5 urgent orders
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="col-span-2 flex flex-col gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              <a href="#" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                  <tr>
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Order 1 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-700">#RX-8821</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">Alexander Thome</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">Oct 24, 2023</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded text-[11px] font-bold tracking-wide uppercase">Processing</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-800">$142.00</td>
                  </tr>
                  {/* Order 2 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-700">#RX-8820</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">Elena Rodriguez</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">Oct 24, 2023</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded text-[11px] font-bold tracking-wide uppercase">Shipped</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-800">$89.50</td>
                  </tr>
                  {/* Order 3 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-700">#RX-8819</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">Marcus Wright</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">Oct 23, 2023</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded text-[11px] font-bold tracking-wide uppercase">Delivered</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-800">$210.25</td>
                  </tr>
                  {/* Order 4 */}
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-700">#RX-8818</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">Sarah O'Connor</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">Oct 23, 2023</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded text-[11px] font-bold tracking-wide uppercase">Delivered</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-800">$45.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Trend Chart (Mock) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Sales Trend</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-xs font-medium text-gray-500">Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                  <span className="text-xs font-medium text-gray-500">Target</span>
                </div>
              </div>
            </div>
            
            {/* Chart visualization */}
            <div className="flex-1 flex items-end gap-2 px-4 pb-2">
                {[4, 6, 8, 7, 10, 12, 9].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group h-full">
                        <div 
                            className="w-full bg-blue-100 group-hover:bg-blue-200 rounded-t-sm transition-all duration-300 max-w-[60px]" 
                            style={{ height: `${height * 8}%` }}
                        ></div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 mt-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-t-4 border-t-danger">
            <h3 className="text-[16px] font-bold text-danger flex items-center gap-2 mb-2">
              <i className="fa-solid fa-triangle-exclamation"></i>
              Low Stock Alert
            </h3>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              The following medications are below critical threshold levels.
            </p>
            
            <div className="space-y-3 mb-6">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Amoxicillin 500mg</h4>
                  <p className="text-[11px] font-bold text-danger uppercase tracking-wide mt-1">12 UNITS LEFT</p>
                </div>
                <button className="text-primary opacity-60 group-hover:opacity-100 transition-opacity bg-white/50 p-2 rounded shrink-0">
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Lisinopril 10mg</h4>
                  <p className="text-[11px] font-bold text-danger uppercase tracking-wide mt-1">8 UNITS LEFT</p>
                </div>
                <button className="text-primary opacity-60 group-hover:opacity-100 transition-opacity bg-white/50 p-2 rounded shrink-0">
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 cursor-pointer">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Metformin 850mg</h4>
                  <p className="text-[11px] font-bold text-warning uppercase tracking-wide mt-1">24 UNITS LEFT</p>
                </div>
                <button className="text-primary opacity-60 group-hover:opacity-100 transition-opacity bg-white/50 p-2 rounded shrink-0">
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>
            </div>

            <button className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-md font-bold text-xs uppercase tracking-wider hover:bg-gray-50 transition-colors">
              Manage Inventory
            </button>
          </div>

          {/* Prescription Accuracy - Dark Card */}
          <div className="bg-[#1A233A] rounded-xl p-6 shadow-sm text-white relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <i className="fa-solid fa-certificate text-9xl"></i>
            </div>
            
            <h3 className="font-semibold text-[15px] mb-1 relative z-10 text-gray-200">Prescription Accuracy</h3>
            <div className="flex items-end gap-3 mb-6 relative z-10">
              <span className="text-[42px] leading-none font-bold tracking-tight">99.8%</span>
              <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded mb-1">↑ 0.2% vs LW</span>
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-[90%] relative z-10">
              Your pharmacy is operating at peak precision. No reported errors in the last 72 hours.
            </p>
          </div>

          {/* Pending Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Pending Tasks</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center mt-0.5 group-hover:border-primary transition-colors bg-gray-50"></div>
                <span className="text-[14px] text-gray-600 select-none group-hover:text-gray-900 transition-colors">Review cold chain log</span>
              </label>
              
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center mt-0.5 group-hover:border-primary transition-colors bg-gray-50"></div>
                <span className="text-[14px] text-gray-600 select-none group-hover:text-gray-900 transition-colors">Approve new vendor list</span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded bg-primary border border-primary flex items-center justify-center mt-0.5 shadow-sm text-white">
                  <i className="fa-solid fa-check text-[10px]"></i>
                </div>
                <span className="text-[14px] text-gray-400 select-none line-through">Monthly narcotics audit</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
