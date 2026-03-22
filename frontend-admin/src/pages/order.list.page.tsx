import { useEffect, useMemo, useState } from 'react'
import {
	getAdminOrderDetail,
	listAdminOrders,
	updateAdminOrderStatus,
	type AdminOrderData,
	type OrderStatus,
	type PaymentStatus,
} from '../services/order.service.ts'

const ORDER_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
	{ value: '', label: 'Tất cả trạng thái' },
	{ value: 'pending', label: 'Chờ xác nhận' },
	{ value: 'confirmed', label: 'Đã xác nhận' },
	{ value: 'shipping', label: 'Đang giao' },
	{ value: 'completed', label: 'Hoàn tất' },
	{ value: 'cancelled', label: 'Đã hủy' },
]

const PAYMENT_STATUS_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
	{ value: 'unpaid', label: 'Chưa thanh toán' },
	{ value: 'pending', label: 'Đang chờ thanh toán' },
	{ value: 'paid', label: 'Đã thanh toán' },
	{ value: 'failed', label: 'Thanh toán thất bại' },
	{ value: 'refunded', label: 'Đã hoàn tiền' },
]

const ORDER_STATUS_UPDATE_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
	{ value: 'pending', label: 'Chờ xác nhận' },
	{ value: 'confirmed', label: 'Đã xác nhận' },
	{ value: 'shipping', label: 'Đang giao' },
	{ value: 'completed', label: 'Hoàn tất' },
	{ value: 'cancelled', label: 'Đã hủy' },
]

const formatDateTime = (value: string) => {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '-'

	return new Intl.DateTimeFormat('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date)
}

const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))}đ`

function OrderListPage() {
	const [items, setItems] = useState<AdminOrderData[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const [statusFilter, setStatusFilter] = useState('')
	const [keywordInput, setKeywordInput] = useState('')
	const [appliedKeyword, setAppliedKeyword] = useState('')
	const [page, setPage] = useState(1)
	const [limit] = useState(10)
	const [totalPages, setTotalPages] = useState(1)
	const [totalItems, setTotalItems] = useState(0)

	const [selectedOrderId, setSelectedOrderId] = useState('')
	const [selectedOrder, setSelectedOrder] = useState<AdminOrderData | null>(null)
	const [isDetailLoading, setIsDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState('')

	const [nextStatus, setNextStatus] = useState<OrderStatus>('pending')
	const [nextPaymentStatus, setNextPaymentStatus] = useState<PaymentStatus>('unpaid')
	const [adminNoteDraft, setAdminNoteDraft] = useState('')
	const [isUpdating, setIsUpdating] = useState(false)
	const [updateMessage, setUpdateMessage] = useState('')

	const selectedOrderSummary = useMemo(() => {
		if (!selectedOrder) return '-'
		return `${selectedOrder.orderCode} • ${selectedOrder.customer.fullName || 'Khách lẻ'}`
	}, [selectedOrder])

	const loadOrders = async () => {
		try {
			setIsLoading(true)
			setErrorMessage('')

			const response = await listAdminOrders({
				status: statusFilter || undefined,
				keyword: appliedKeyword || undefined,
				page,
				limit,
			})

			setItems(response.items)
			setTotalPages(response.pagination.totalPages || 1)
			setTotalItems(response.pagination.total || 0)

			if (response.items.length > 0 && !selectedOrderId) {
				setSelectedOrderId(response.items[0].id)
			}

			if (response.items.length === 0) {
				setSelectedOrderId('')
				setSelectedOrder(null)
			}
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : 'Lỗi tải danh sách đơn hàng')
		} finally {
			setIsLoading(false)
		}
	}

	const loadOrderDetail = async (orderId: string) => {
		if (!orderId) {
			setSelectedOrder(null)
			return
		}

		try {
			setIsDetailLoading(true)
			setDetailError('')

			const detail = await getAdminOrderDetail(orderId)
			setSelectedOrder(detail)
			setNextStatus(detail.status)
			setNextPaymentStatus(detail.paymentStatus)
			setAdminNoteDraft(detail.adminNote || '')
		} catch (error) {
			setDetailError(error instanceof Error ? error.message : 'Lỗi tải chi tiết đơn hàng')
			setSelectedOrder(null)
		} finally {
			setIsDetailLoading(false)
		}
	}

	useEffect(() => {
		void loadOrders()
	}, [statusFilter, appliedKeyword, page])

	useEffect(() => {
		void loadOrderDetail(selectedOrderId)
	}, [selectedOrderId])

	const handleSearch = () => {
		setPage(1)
		setAppliedKeyword(keywordInput.trim())
	}

	const handleResetFilter = () => {
		setStatusFilter('')
		setKeywordInput('')
		setAppliedKeyword('')
		setPage(1)
	}

	const handleUpdateOrder = async () => {
		if (!selectedOrderId) return

		try {
			setIsUpdating(true)
			setUpdateMessage('')

			const updated = await updateAdminOrderStatus(selectedOrderId, {
				status: nextStatus,
				paymentStatus: nextPaymentStatus,
				adminNote: adminNoteDraft,
			})

			setSelectedOrder(updated)
			setUpdateMessage('Đã cập nhật trạng thái đơn hàng thành công.')
			await loadOrders()
		} catch (error) {
			setUpdateMessage(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái đơn hàng')
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<div className="admin-order-page">
			<header className="admin-order-header">
				<div>
					<h1>Quản lý đơn hàng</h1>
					<p>Theo dõi, xem chi tiết và cập nhật trạng thái đơn hàng của khách.</p>
				</div>
			</header>

			<section className="admin-order-filters">
				<select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1) }}>
					{ORDER_STATUS_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>{option.label}</option>
					))}
				</select>

				<input
					type="text"
					placeholder="Tìm theo mã đơn, tên người nhận, số điện thoại"
					value={keywordInput}
					onChange={(event) => setKeywordInput(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							handleSearch()
						}
					}}
				/>

				<button type="button" onClick={handleSearch}>Tìm kiếm</button>
				<button type="button" className="secondary" onClick={handleResetFilter}>Đặt lại</button>
			</section>

			<section className="admin-order-grid">
				<article className="admin-order-list-card">
					<div className="list-header">
						<strong>Danh sách đơn hàng</strong>
						<span>Tổng: {totalItems}</span>
					</div>

					{isLoading && <p className="state-message">Đang tải danh sách đơn hàng...</p>}
					{!isLoading && errorMessage && <p className="state-message error">{errorMessage}</p>}

					{!isLoading && !errorMessage && items.length === 0 && (
						<p className="state-message">Không tìm thấy đơn hàng phù hợp.</p>
					)}

					{!isLoading && !errorMessage && items.length > 0 && (
						<div className="order-table-wrapper">
							<table className="order-table">
								<thead>
									<tr>
										<th>Mã đơn</th>
										<th>Khách hàng</th>
										<th>Tổng tiền</th>
										<th>Trạng thái</th>
										<th>Thanh toán</th>
										<th>Đặt lúc</th>
									</tr>
								</thead>
								<tbody>
									{items.map((order) => (
										<tr
											key={order.id}
											className={selectedOrderId === order.id ? 'active' : ''}
											onClick={() => setSelectedOrderId(order.id)}
										>
											<td>{order.orderCode}</td>
											<td>{order.customer.fullName || order.shippingAddress.recipientName}</td>
											<td>{formatCurrency(order.totalAmount)}</td>
											<td>{order.status}</td>
											<td>{order.paymentStatus}</td>
											<td>{formatDateTime(order.placedAt)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					<div className="pagination-row">
						<button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Trang trước</button>
						<span>Trang {page} / {Math.max(1, totalPages)}</span>
						<button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Trang sau</button>
					</div>
				</article>

				<article className="admin-order-detail-card">
					<div className="list-header">
						<strong>Chi tiết đơn hàng</strong>
						<span>{selectedOrderSummary}</span>
					</div>

					{isDetailLoading && <p className="state-message">Đang tải chi tiết đơn hàng...</p>}
					{!isDetailLoading && detailError && <p className="state-message error">{detailError}</p>}

					{!isDetailLoading && !detailError && !selectedOrder && (
						<p className="state-message">Chọn một đơn hàng để xem chi tiết.</p>
					)}

					{!isDetailLoading && !detailError && selectedOrder && (
						<div className="detail-content">
							<div className="detail-block">
								<h3>Thông tin giao hàng</h3>
								<p><strong>Người nhận:</strong> {selectedOrder.shippingAddress.recipientName}</p>
								<p><strong>Số điện thoại:</strong> {selectedOrder.shippingAddress.phone}</p>
								<p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress.fullAddress}</p>
								<p><strong>Ghi chú khách:</strong> {selectedOrder.note || '-'}</p>
							</div>

							<div className="detail-block">
								<h3>Sản phẩm trong đơn</h3>
								<ul className="product-list">
									{selectedOrder.items.map((item) => (
										<li key={`${selectedOrder.id}-${item.productId}`}>
											<img src={item.productImage || 'https://via.placeholder.com/80x80?text=SP'} alt={item.productName} />
											<div>
												<p>{item.productName}</p>
												<small>Mã: {item.medicineCode || '-'} • SL: {item.quantity} • Đơn giá: {formatCurrency(item.unitPrice)}</small>
											</div>
											<strong>{formatCurrency(item.lineTotal)}</strong>
										</li>
									))}
								</ul>
							</div>

							<div className="detail-block">
								<h3>Cập nhật trạng thái</h3>
								<div className="status-form-grid">
									<label>
										Trạng thái đơn hàng
										<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as OrderStatus)}>
											{ORDER_STATUS_UPDATE_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>{option.label}</option>
											))}
										</select>
									</label>

									<label>
										Trạng thái thanh toán
										<select value={nextPaymentStatus} onChange={(event) => setNextPaymentStatus(event.target.value as PaymentStatus)}>
											{PAYMENT_STATUS_OPTIONS.map((option) => (
												<option key={option.value} value={option.value}>{option.label}</option>
											))}
										</select>
									</label>
								</div>

								<label>
									Ghi chú admin
									<textarea
										rows={3}
										value={adminNoteDraft}
										onChange={(event) => setAdminNoteDraft(event.target.value)}
										placeholder="Nhập ghi chú nội bộ..."
									/>
								</label>

								<div className="actions-row">
									<button type="button" onClick={handleUpdateOrder} disabled={isUpdating}>
										{isUpdating ? 'Đang cập nhật...' : 'Lưu cập nhật'}
									</button>
									{updateMessage && <span className="update-message">{updateMessage}</span>}
								</div>
							</div>
						</div>
					)}
				</article>
			</section>
		</div>
	)
}

export default OrderListPage

