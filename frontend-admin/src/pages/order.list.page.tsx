export default function OrdersPage() {
    const orders = [
      {
        id: '#RX-88291',
        patientInitials: 'EM',
        patientColor: 'bg-blue-100 text-blue-600',
        patientName: 'Eleanor Miller',
        patientId: 'ID: 992-001-A',
        medication: 'Atorvastatin 20mg',
        date: 'Oct 24, 2023',
        status: 'PROCESSING',
        statusColor: 'bg-green-50 text-green-600',
        value: '$142.50'
      },
      {
        id: '#RX-88292',
        patientInitials: 'JD',
        patientColor: 'bg-indigo-100 text-indigo-600',
        patientName: 'Jameson Doherty',
        patientId: 'ID: 881-224-C',
        medication: 'Amoxicillin 500mg',
        date: 'Oct 24, 2023',
        status: 'SHIPPED',
        statusColor: 'bg-blue-50 text-blue-600',
        value: '$38.12'
      },
      {
        id: '#RX-88295',
        patientInitials: 'SW',
        patientColor: 'bg-teal-100 text-teal-600',
        patientName: 'Sarah Waters',
        patientId: 'ID: 412-909-B',
        medication: 'Lisinopril 10mg',
        date: 'Oct 23, 2023',
        status: 'ON HOLD',
        statusColor: 'bg-orange-50 text-orange-600',
        value: '$210.00'
      },
      {
        id: '#RX-88301',
        patientInitials: 'AL',
        patientColor: 'bg-rose-100 text-rose-600',
        patientName: 'Arthur Lewis',
        patientId: 'ID: 003-112-D',
        medication: 'Metformin 500mg',
        date: 'Oct 23, 2023',
        status: 'CANCELLED',
        statusColor: 'bg-gray-100 text-gray-500',
        value: '$12.40'
      }
    ];
  
    return (
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex justify-between items-end mb-2">
            <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-widest uppercase mb-2">
                    OPERATIONAL CONSOLE
                </div>
                <h1 className="text-[28px] font-bold text-gray-900 mb-1">Order Management</h1>
                <p className="text-gray-500 text-[15px]">Real-time prescription monitoring and pharmaceutical logistics oversight.</p>
            </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-md text-gray-700 font-bold text-[13px] hover:bg-gray-50 transition-colors shadow-sm">
              <i className="fa-solid fa-download text-gray-400"></i>
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-dark text-white rounded-md font-bold text-[13px] hover:bg-gray-900 transition-colors shadow-sm">
              <i className="fa-solid fa-plus"></i>
              Direct Entry
            </button>
          </div>
        </div>
  
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden">
           {/* Filters Toolbar */}
           <div className="p-6 border-b border-gray-100 flex items-end gap-6 bg-gray-50/30">
               <div className="flex-1">
                   <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Order Status</label>
                   <div className="relative">
                       <select className="w-full appearance-none bg-white border border-gray-200 rounded-md py-2.5 pl-4 pr-10 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-gray-700 font-medium cursor-pointer relative z-10 bg-transparent">
                           <option>All Statuses</option>
                       </select>
                       <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none z-0"></i>
                   </div>
               </div>
               
               <div className="flex-1">
                   <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Date Range</label>
                   <div className="relative">
                       <button className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-md py-2.5 px-4 text-sm text-gray-700 font-medium">
                           <span className="flex items-center gap-2"><i className="fa-regular fa-calendar text-gray-400"></i> Last 30 Days</span>
                       </button>
                   </div>
               </div>

               <div className="flex-1">
                   <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Customer Priority</label>
                   <div className="relative">
                       <select className="w-full appearance-none bg-white border border-gray-200 rounded-md py-2.5 pl-4 pr-10 text-sm focus:ring-1 focus:ring-primary focus:outline-none text-gray-700 font-medium cursor-pointer relative z-10 bg-transparent">
                           <option>All Priorities</option>
                       </select>
                       <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none z-0"></i>
                   </div>
               </div>

               <button className="px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-md font-bold text-[13px] hover:bg-blue-100 transition-colors shadow-sm">
                   <i className="fa-solid fa-filter"></i> Apply Filters
               </button>
           </div>
  
           {/* Table */}
           <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="text-[11px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100 bg-white">
                    <tr>
                      <th className="px-6 py-5">Order ID</th>
                      <th className="px-6 py-5">Patient / Customer</th>
                      <th className="px-6 py-5">Medication</th>
                      <th className="px-6 py-5">Order Date</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Value</th>
                      <th className="px-6 py-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                      {orders.map((order, index) => (
                          <tr key={index} className="hover:bg-gray-50 flex-row transition-colors group">
                              <td className="px-6 py-5 font-bold text-gray-800">{order.id}</td>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-xs ${order.patientColor}`}>
                                          {order.patientInitials}
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="font-bold text-gray-800 text-[14px]">{order.patientName}</span>
                                          <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5">{order.patientId}</span>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-5">
                                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                                      <i className="fa-solid fa-pills text-gray-300"></i> {order.medication}
                                  </div>
                              </td>
                              <td className="px-6 py-5 text-gray-600 font-medium">{order.date}</td>
                              <td className="px-6 py-5">
                                  <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded items-center inline-flex tracking-widest uppercase ${order.statusColor}`}>
                                      {order.status}
                                  </span>
                              </td>
                              <td className="px-6 py-5 font-bold text-gray-800">{order.value}</td>
                              <td className="px-6 py-5 text-center">
                                  <button className="text-gray-400 hover:text-primary transition-colors p-2 opacity-0 group-hover:opacity-100">
                                      <i className="fa-solid fa-ellipsis-vertical"></i>
                                  </button>
                                  <div className="w-8 opacity-100 group-hover:hidden flex items-center justify-center"></div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
           </div>
  
           {/* Pagination */}
           <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-white">
               <div className="text-sm font-medium text-gray-500 italic">
                   Showing 1 to 4 of 124 results
               </div>
               <div className="flex gap-1">
                   <button className="w-8 h-8 flex items-center justify-center bg-primary text-white font-medium text-sm rounded shadow-sm hover:bg-primary-dark transition-colors">1</button>
                   <button className="w-8 h-8 flex items-center justify-center bg-white border border-transparent text-gray-600 font-medium text-sm hover:bg-gray-100 rounded transition-colors">2</button>
                   <button className="w-8 h-8 flex items-center justify-center bg-white border border-transparent text-gray-600 font-medium text-sm hover:bg-gray-100 rounded transition-colors">3</button>
                   <span className="w-8 h-8 flex items-center justify-center text-gray-400 font-medium text-sm">...</span>
                   <button className="w-8 h-8 flex items-center justify-center bg-white border border-transparent text-gray-600 font-medium text-sm hover:bg-gray-100 rounded transition-colors">31</button>
                   <button className="w-8 h-8 flex items-center justify-center bg-white border border-transparent text-gray-400 font-medium text-xs hover:bg-gray-100 rounded transition-colors">
                      <i className="fa-solid fa-chevron-right"></i>
                   </button>
               </div>
           </div>
        </div>

        {/* Bottom Metrics Cards */}
        <div className="grid grid-cols-4 gap-6 mt-2">
            {/* Daily Throughput */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-28">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Throughput</p>
               <div className="flex justify-between items-end">
                  <h2 className="text-[32px] font-bold text-gray-800 leading-none">1,204</h2>
                  <p className="text-[12px] font-bold text-success flex items-center gap-1">
                     <i className="fa-solid fa-arrow-trend-up text-[10px]"></i> +12%
                  </p>
               </div>
            </div>

            {/* Pending Fulfillment */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-28">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending Fulfillment</p>
               <div className="flex justify-between items-end">
                  <h2 className="text-[32px] font-bold text-gray-800 leading-none">48</h2>
                  <p className="text-[11px] font-bold text-danger flex items-center gap-1 uppercase tracking-widest">
                     Needs Action
                  </p>
               </div>
            </div>

            {/* Avg Process Time */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-28">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Process Time</p>
               <div className="flex justify-between items-end">
                  <h2 className="text-[32px] font-bold text-gray-800 leading-none">1.4h</h2>
                  <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                     Goal: &lt; 2h
                  </p>
               </div>
            </div>

            {/* Logistics Status */}
            <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-28">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logistics Status</p>
               <div className="flex justify-between items-center h-full pt-4">
                  <div className="flex items-center gap-2">
                     <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                      </span>
                     <span className="text-[15px] font-bold text-gray-800">Systems Nominal</span>
                  </div>
               </div>
            </div>
        </div>
      </div>
    );
  }
  
