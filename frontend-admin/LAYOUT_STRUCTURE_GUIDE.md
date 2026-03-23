# 📐 LAYOUT STRUCTURE & DATA LOADING GUIDE

## 🎯 CẤU TRÚC LAYOUT HIỆN TẠI

```
AdminLayout (Thành phần gốc)
│
├─ Sidebar (Menu bên trái)
│  └ navLinks (Dashboard, Orders, Inventory, Customers, Reports)
│
├─ Topbar (Header trên cùng)
│  └ Search bar, Notifications, User Profile
│
└─ Main Content
   └ <Outlet /> (Page hiện tại)
```

### 📁 File Liên Quan (Hiện Tại)

```
src/components/layout/
├── AdminLayout.tsx        ← Layout chính
├── Sidebar.tsx           ← Menu trái
└── Topbar.tsx            ← Header trên

✓ Các file này đã hoạt động!
```

---

## 📋 HƯỚNG DẪN LOAD DATA ĐƠN HÀNG

Để load data đơn hàng lên, bạn cần tạo một **chuỗi file** theo thứ tự:

### 1️⃣ **Types/Interfaces** (Định nghĩa cấu trúc dữ liệu)

**File: `src/types/order.ts`**

```typescript
export interface Order {
  _id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}
```

---

### 2️⃣ **Service** (Gọi API từ backend)

**File: `src/services/order.service.ts`**

```typescript
import axios from 'axios';
import { Order, OrderListResponse, OrderFilterParams } from '../types/order';

const API_BASE = 'http://localhost:5000/api';

const orderService = {
  // Lấy danh sách đơn hàng
  getOrders: async (params?: OrderFilterParams): Promise<OrderListResponse> => {
    const response = await axios.get(`${API_BASE}/orders`, { params });
    return response.data;
  },

  // Lấy chi tiết một đơn hàng
  getOrderById: async (orderId: string): Promise<{ data: Order }> => {
    const response = await axios.get(`${API_BASE}/orders/${orderId}`);
    return response.data;
  },

  // Cập nhật trạng thái đơn hàng
  updateOrderStatus: async (orderId: string, status: string) => {
    const response = await axios.put(`${API_BASE}/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Xóa đơn hàng
  deleteOrder: async (orderId: string) => {
    const response = await axios.delete(`${API_BASE}/orders/${orderId}`);
    return response.data;
  },

  // Export đơn hàng ra Excel
  exportOrders: async (params?: OrderFilterParams) => {
    const response = await axios.get(`${API_BASE}/orders/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default orderService;
```

---

### 3️⃣ **Zustand Store** (Lưu state)

**File: `src/stores/orderStore.ts`**

```typescript
import { create } from 'zustand';
import { Order, OrderFilterParams, OrderListResponse } from '../types/order';
import orderService from '../services/order.service';

interface OrderState {
  // Data
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;

  // Pagination
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  // Filters
  filters: OrderFilterParams;

  // Actions
  fetchOrders: (params?: OrderFilterParams) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  setFilters: (filters: OrderFilterParams) => void;
  clearError: () => void;
}

const useOrderStore = create<OrderState>((set) => ({
  // Initial State
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  filters: {},

  // Actions
  fetchOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getOrders(params);
      set({
        orders: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        loading: false,
      });
    }
  },

  fetchOrderById: async (orderId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await orderService.getOrderById(orderId);
      set({
        currentOrder: response.data,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch order',
        loading: false,
      });
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      // Refresh orders list
      const state = useOrderStore.getState();
      await state.fetchOrders(state.filters);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update order',
      });
    }
  },

  deleteOrder: async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      // Refresh orders list
      const state = useOrderStore.getState();
      await state.fetchOrders(state.filters);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete order',
      });
    }
  },

  setFilters: (filters: OrderFilterParams) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),
}));

export default useOrderStore;
```

---

### 4️⃣ **Custom Hook** (Logic tái sử dụng)

**File: `src/hooks/useOrderList.ts`**

```typescript
import { useEffect, useState } from 'react';
import useOrderStore from '../stores/orderStore';
import { OrderFilterParams } from '../types/order';

export const useOrderList = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    filters,
    fetchOrders,
    setFilters,
    clearError,
  } = useOrderStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load initial data
  useEffect(() => {
    fetchOrders({
      page: 1,
      limit: 10,
    });
  }, []);

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const newFilters = { ...filters, search: term, page: 1 };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    const newFilters = {
      ...filters,
      status: status || undefined,
      page: 1,
    };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  return {
    orders,
    loading,
    error,
    pagination,
    searchTerm,
    selectedStatus,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    clearError,
  };
};
```

---

### 5️⃣ **Components** (Hiển thị giao diện)

#### **A. OrderTable Component**

**File: `src/components/orders/OrderTable.tsx`**

```typescript
import { Order } from '../../types/order';

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  onStatusChange: (orderId: string, status: string) => void;
  onDelete: (orderId: string) => void;
}

export default function OrderTable({
  orders,
  loading,
  onStatusChange,
  onDelete,
}: OrderTableProps) {
  if (loading) {
    return <div className="text-center py-8">⌛ Loading...</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-gray-500">📭 No orders found</div>;
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Order Code</th>
            <th className="px-4 py-3 text-left font-semibold">Customer</th>
            <th className="px-4 py-3 text-left font-semibold">Phone</th>
            <th className="px-4 py-3 text-right font-semibold">Total</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
            <th className="px-4 py-3 text-center font-semibold">Created</th>
            <th className="px-4 py-3 text-center font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-blue-600">{order.orderCode}</td>
              <td className="px-4 py-3">{order.customerName}</td>
              <td className="px-4 py-3">{order.customerPhone}</td>
              <td className="px-4 py-3 text-right font-semibold">
                {order.totalAmount.toLocaleString()} VND
              </td>
              <td className="px-4 py-3 text-center">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order._id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium cursor-pointer border-0 ${getStatusBadge(order.status)}`}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✓ Confirmed</option>
                  <option value="shipped">📦 Shipped</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </td>
              <td className="px-4 py-3 text-center text-xs text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-4 py-3 text-center space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-lg">👁️</button>
                <button
                  onClick={() => onDelete(order._id)}
                  className="text-red-600 hover:text-red-800 text-lg"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### **B. OrderFilters Component**

**File: `src/components/orders/OrderFilters.tsx`**

```typescript
interface OrderFiltersProps {
  searchTerm: string;
  selectedStatus: string;
  onSearch: (term: string) => void;
  onStatusChange: (status: string) => void;
}

export default function OrderFilters({
  searchTerm,
  selectedStatus,
  onSearch,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="flex gap-4 mb-6 p-4 bg-white rounded-lg border">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="🔍 Search by order code, customer..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Status Filter */}
      <div>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✓ Confirmed</option>
          <option value="shipped">📦 Shipped</option>
          <option value="delivered">✅ Delivered</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
      </div>

      {/* Clear Filters */}
      <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
        🔄 Reset
      </button>
    </div>
  );
}
```

---

### 6️⃣ **Page Component** (Trang đơn hàng)

**File: `src/pages/OrdersPage.tsx`**

```typescript
import { useOrderList } from '../hooks/useOrderList';
import { useOrderStore } from '../stores/orderStore';
import OrderFilters from '../components/orders/OrderFilters';
import OrderTable from '../components/orders/OrderTable';
import Pagination from '../components/common/Pagination';

export default function OrdersPage() {
  const {
    orders,
    loading,
    error,
    pagination,
    searchTerm,
    selectedStatus,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    clearError,
  } = useOrderList();

  const { updateOrderStatus, deleteOrder } = useOrderStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">📋 Orders Management</h1>
          <p className="text-gray-600 text-sm">Manage and track all customer orders</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          + New Order
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold">×</button>
        </div>
      )}

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        selectedStatus={selectedStatus}
        onSearch={handleSearch}
        onStatusChange={handleStatusFilter}
      />

      {/* Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onStatusChange={(orderId, status) =>
          updateOrderStatus(orderId, status)
        }
        onDelete={(orderId) => deleteOrder(orderId)}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

---

### 7️⃣ **Routing Setup**

**File: `src/App.tsx` (hoặc `src/routes/index.tsx`)**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import OrdersPage from './pages/OrdersPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          {/* Other routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 📊 TÓМTẮT - CÁC FILE CẦN TẠO

| Thứ tự | File Path | Mục Đích | Dòng Số |
|--------|-----------|---------|--------|
| 1️⃣ | `src/types/order.ts` | Định nghĩa interfaces | 30 |
| 2️⃣ | `src/services/order.service.ts` | Gọi API | 50 |
| 3️⃣ | `src/stores/orderStore.ts` | Zustand state | 100 |
| 4️⃣ | `src/hooks/useOrderList.ts` | Logic tái sử dụng | 70 |
| 5️⃣ | `src/components/orders/OrderTable.tsx` | Hiển thị bảng | 80 |
| 6️⃣ | `src/components/orders/OrderFilters.tsx` | Filter & Search | 50 |
| 7️⃣ | `src/pages/OrdersPage.tsx` | Trang chính | 90 |
| 8️⃣ | `src/App.tsx` | Cập nhật routing | 20 |

---

## 🔄 FLOW LOAD DATA ĐƠN HÀNG

```
User vào trang Orders
      ↓
OrdersPage mount
      ↓
useOrderList hook → gọi fetchOrders()
      ↓
fetchOrders() → gọi orderService.getOrders()
      ↓
orderService → gọi API: GET /api/orders
      ↓
Backend trả về data
      ↓
Store update state (orders, pagination)
      ↓
Component render → OrderTable hiển thị data
      ↓
User có thể: search, filter, change status, delete
```

---

## ⚙️ CẤU HÌNH AXIOS (Important!)

**File: `src/utils/axiosConfig.ts`**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

Rồi dùng trong service:
```typescript
import api from '../utils/axiosConfig';

const orderService = {
  getOrders: async (params?: OrderFilterParams) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
};
```

---

## 🎯 BƯỚC TIẾP THEO

1. ✅ **AdminLayout.tsx** - Đã có (Sidebar + Topbar)
2. ✅ **Sidebar.tsx** - Đã có
3. ✅ **Topbar.tsx** - Đã có
4. ⏳ Tạo **src/types/order.ts**
5. ⏳ Tạo **src/services/order.service.ts**
6. ⏳ Tạo **src/stores/orderStore.ts**
7. ⏳ Tạo **src/hooks/useOrderList.ts**
8. ⏳ Tạo **src/components/orders/** (OrderTable + OrderFilters)
9. ⏳ Tạo **src/pages/OrdersPage.tsx**
10. ⏳ Cập nhật **src/App.tsx** (routing)

---

**💡 Tip:** Bạn hãy bắt đầu từ file #1 (types), rồi lần lượt tạo các file tiếp theo. Cách này đảm bảo dependencies đúng thứ tự!
