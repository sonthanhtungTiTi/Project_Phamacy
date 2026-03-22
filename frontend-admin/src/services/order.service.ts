const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet' | 'momo'

export interface AdminOrderItem {
  productId: string
  medicineCode: string
  productName: string
  productImage: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface AdminOrderData {
  id: string
  orderCode: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalQuantity: number
  totalAmount: number
  note: string
  adminNote: string
  cancelReason: string
  placedAt: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    fullName: string
    email: string
    phone: string
  }
  shippingAddress: {
    addressId: string
    label: 'home' | 'office' | 'other'
    recipientName: string
    phone: string
    provinceName: string
    districtName: string
    wardName: string
    street: string
    note: string
    fullAddress: string
  }
  items: AdminOrderItem[]
}

export interface ListOrdersQuery {
  status?: string
  keyword?: string
  page?: number
  limit?: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

interface PaginatedOrders {
  items: AdminOrderData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const getAccessToken = () => localStorage.getItem('adminAccessToken') || localStorage.getItem('clientAccessToken') || ''

const getAuthHeaders = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Thiếu access token admin. Vui lòng đăng nhập lại.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const listAdminOrders = async (query: ListOrdersQuery = {}) => {
  const searchParams = new URLSearchParams()
  if (query.status) searchParams.set('status', query.status)
  if (query.keyword) searchParams.set('keyword', query.keyword)
  if (query.page) searchParams.set('page', String(query.page))
  if (query.limit) searchParams.set('limit', String(query.limit))

  const response = await fetch(`${API_BASE_URL}/admin/orders?${searchParams.toString()}`, {
    headers: getAuthHeaders(),
  })

  const payload = (await response.json()) as ApiResponse<PaginatedOrders>
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || payload.error || 'Không thể tải danh sách đơn hàng')
  }

  return payload.data
}

export const getAdminOrderDetail = async (orderId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
    headers: getAuthHeaders(),
  })

  const payload = (await response.json()) as ApiResponse<AdminOrderData>
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || payload.error || 'Không thể tải chi tiết đơn hàng')
  }

  return payload.data
}

export const updateAdminOrderStatus = async (
  orderId: string,
  payload: { status?: OrderStatus; paymentStatus?: PaymentStatus; adminNote?: string },
) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  const result = (await response.json()) as ApiResponse<AdminOrderData>
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || result.error || 'Không thể cập nhật trạng thái đơn hàng')
  }

  return result.data
}
