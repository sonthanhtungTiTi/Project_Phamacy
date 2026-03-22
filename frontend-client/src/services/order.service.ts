const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export type PaymentMethod = 'cod' | 'bank_transfer' | 'e_wallet' | 'momo'

export interface CheckoutPayload {
	addressId: string
	note?: string
	paymentMethod?: PaymentMethod
	selectedProductIds?: string[]
}

export interface OrderItem {
	productId: string
	medicineCode: string
	productName: string
	productImage: string
	unitPrice: number
	quantity: number
	lineTotal: number
}

export interface OrderData {
	id: string
	orderCode: string
	userId: string
	status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled'
	paymentMethod: PaymentMethod
	paymentStatus: 'unpaid' | 'paid' | 'refunded'
	totalQuantity: number
	totalAmount: number
	note: string
	adminNote: string
	cancelReason: string
	placedAt: string
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
	items: OrderItem[]
	createdAt: string
	updatedAt: string
}

interface OrderResponse {
	success: boolean
	message: string
	data?: OrderData
	error?: string
}

const getAccessToken = () => localStorage.getItem('clientAccessToken') || ''

const getAuthHeaders = () => {
	const accessToken = getAccessToken()
	if (!accessToken) {
		throw new Error('Vui long dang nhap de dat hang')
	}

	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${accessToken}`,
	}
}

export const checkoutFromCart = async (payload: CheckoutPayload) => {
	const response = await fetch(`${API_BASE_URL}/client/orders/checkout`, {
		method: 'POST',
		headers: getAuthHeaders(),
		body: JSON.stringify(payload),
	})

	const data = (await response.json()) as OrderResponse
	if (!response.ok || !data.success || !data.data) {
		throw new Error(data.message || data.error || 'Checkout failed')
	}

	return data.data
}
