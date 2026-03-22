import { useEffect, useState } from 'react'
import PharmacyLayout from '../components/layout/layout'
import { checkOrderPaymentStatus, getOrderDetails } from '../services/momo.service'

const MomoResultPage = () => {
	const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading')
	const [orderData, setOrderData] = useState<any>(null)
	const [statusMessage, setStatusMessage] = useState('')

	useEffect(() => {
		const handleMomoReturn = async () => {
			try {
				// Parse query parameters từ Momo redirect
				const params = new URLSearchParams(window.location.search)
				const orderId = params.get('orderId') || sessionStorage.getItem('momoOrderId')

				if (!orderId) {
					setPaymentStatus('failed')
					setStatusMessage('Không tìm thấy thông tin đơn hàng')
					return
				}

				// Poll payment status (Momo callback từ server mất vài giây)
				let attempts = 0
				const maxAttempts = 30 // Thử 30 lần (30 giây)
				let isPaid = false

				while (attempts < maxAttempts && !isPaid) {
					try {
						const statusResult = await checkOrderPaymentStatus(orderId)

						if (statusResult.paymentStatus === 'paid') {
							isPaid = true
							setPaymentStatus('success')
							setStatusMessage('Thanh toán Momo thành công! Đơn hàng của bạn đã được xác nhận.')

							// Get full order details
							const orderDetails = await getOrderDetails(orderId)
							setOrderData(orderDetails.data || orderDetails)
							break
						}

						if (statusResult.paymentStatus === 'failed') {
							setPaymentStatus('failed')
							setStatusMessage('Thanh toán thất bại. Vui lòng thử lại.')
							break
						}
					} catch (error) {
						// Continue polling
					}

					attempts++
					await new Promise((resolve) => setTimeout(resolve, 1000))
				}

				if (!isPaid && attempts >= maxAttempts) {
					// Timeout - payment processing might still be happening
					setPaymentStatus('loading')
					setStatusMessage(
						'Giao dịch đang xử lý. Vui lòng chờ hoặc quay lại trang chủ để kiểm tra đơn hàng.'
					)
				}

				sessionStorage.removeItem('momoOrderId')
			} catch (error) {
				console.error('Error handling Momo return:', error)
				setPaymentStatus('failed')
				setStatusMessage('Có lỗi xảy ra khi xử lý thanh toán.')
			}
		}

		handleMomoReturn()
	}, [])

	const handleBackHome = () => {
		window.location.href = '/'
	}

	const handleBackOrders = () => {
		window.location.href = '/profile#orders'
	}

	return (
		<PharmacyLayout categories={[]}>
			<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
					{paymentStatus === 'loading' && (
						<>
							<div className="flex justify-center mb-4">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
							</div>
							<h1 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý</h1>
							<p className="text-gray-600 mb-6">{statusMessage}</p>
						</>
					)}

					{paymentStatus === 'success' && (
						<>
							<div className="flex justify-center mb-4">
								<div
									className="flex items-center justify-center w-12 h-12 rounded-full"
									style={{ backgroundColor: '#35b548' }}
								>
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
							</div>
							<h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công</h1>
							<p className="text-gray-600 mb-6">{statusMessage}</p>
							{orderData && (
								<div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
									<p className="text-sm text-gray-600 mb-2">
										<strong>Mã đơn hàng:</strong> {orderData.orderCode}
									</p>
									<p className="text-sm text-gray-600 mb-2">
										<strong>Số tiền:</strong>{' '}
										{new Intl.NumberFormat('vi-VN', {
											style: 'currency',
											currency: 'VND',
										}).format(orderData.totalAmount)}
									</p>
									<p className="text-sm text-gray-600">
										<strong>Trạng thái:</strong> <span style={{ color: '#35b548' }}>Đã thanh toán</span>
									</p>
								</div>
							)}
						</>
					)}

					{paymentStatus === 'failed' && (
						<>
							<div className="flex justify-center mb-4">
								<div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
									<svg
										className="w-6 h-6 text-red-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</div>
							</div>
							<h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
							<p className="text-gray-600 mb-6">{statusMessage}</p>
						</>
					)}

					<div className="flex gap-4">
						<button
							onClick={handleBackHome}
							className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
						>
							Về trang chủ
						</button>
						{paymentStatus === 'success' && (
							<button
								onClick={handleBackOrders}
								className="flex-1 px-4 py-2 text-white rounded-lg transition"
								style={{ backgroundColor: '#35b548' }}
							>
								Xem đơn hàng
							</button>
						)}
					</div>
				</div>
			</div>
		</PharmacyLayout>
	)
}

export default MomoResultPage
