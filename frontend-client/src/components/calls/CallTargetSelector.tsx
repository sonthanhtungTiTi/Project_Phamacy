/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react'
import { Phone, Video, X, User, Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface StaffMember {
	_id: string
	fullName: string
	email: string
	avatar: string
	role: string
	department: string | null
	isOnline: boolean
}

interface OnlineUser {
	userId: string
}

interface CallTargetSelectorProps {
	isOpen: boolean
	onClose: () => void
	onSelectTarget: (staffId: string, staffName: string, staffAvatar: string, callType: 'video' | 'voice') => void
	socket: any
}

const ROLE_LABELS: Record<string, string> = {
	pharmacist: 'Dược sĩ',
	admin: 'Quản trị viên',
	manager: 'Quản lý',
	sales_staff: 'Nhân viên bán hàng',
}

const ROLE_COLORS: Record<string, string> = {
	pharmacist: 'bg-emerald-100 text-emerald-700',
	admin: 'bg-blue-100 text-blue-700',
	manager: 'bg-purple-100 text-purple-700',
	sales_staff: 'bg-amber-100 text-amber-700',
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '')

export default function CallTargetSelector({
	isOpen,
	onClose,
	onSelectTarget,
	socket,
}: CallTargetSelectorProps) {
	const [staffList, setStaffList] = useState<StaffMember[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const applyOnlineUsers = useCallback((onlineUsers: OnlineUser[]) => {
		const onlineSet = new Set((onlineUsers || []).map((item) => String(item.userId)))
		setStaffList((prev) =>
			prev.map((staff) => ({
				...staff,
				isOnline: onlineSet.has(String(staff._id)),
			}))
		)
	}, [])

	const fetchStaff = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const accessToken = localStorage.getItem('clientAccessToken') || ''
			const response = await fetch(`${API_BASE_URL}/client/staff/available`, {
				headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
			})

			const isJson = response.headers.get('content-type')?.includes('application/json')
			const payload = isJson ? await response.json() : null

			if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
				throw new Error(payload?.message || payload?.error || 'Không thể tải danh sách')
			}

			setStaffList(payload.data)
		} catch (err) {
			console.error('[CallTargetSelector] Fetch available staff failed:', err)
			setError(err instanceof Error ? err.message : 'Lỗi kết nối đến server')
		} finally {
			setLoading(false)
		}
	}, [])

	// Fetch staff when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchStaff()
		}
	}, [isOpen, fetchStaff])

	// Đồng bộ trạng thái online theo event Socket mới từ backend.
	useEffect(() => {
		if (!socket || !isOpen) return

		const handleOnlineUsersUpdate = (onlineUsers: OnlineUser[]) => {
			applyOnlineUsers(onlineUsers)
		}

		socket.on('online-users:update', handleOnlineUsersUpdate)

		socket.emit('get-online-users', (onlineUsers: OnlineUser[]) => {
			applyOnlineUsers(onlineUsers)
		})

		return () => {
			socket.off('online-users:update', handleOnlineUsersUpdate)
		}
	}, [socket, isOpen, applyOnlineUsers])

	if (!isOpen) return null

	const onlineCount = staffList.filter((s) => s.isOnline).length

	const handleSelect = (staff: StaffMember, callType: 'video' | 'voice') => {
		onSelectTarget(staff._id, staff.fullName, staff.avatar, callType)
		onClose()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold text-white">Chọn người tư vấn</h2>
							<p className="text-blue-100 text-sm mt-1">
								{onlineCount > 0
									? `${onlineCount} nhân viên đang trực`
									: 'Không có nhân viên trực tuyến'}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={fetchStaff}
								className="p-2 rounded-full hover:bg-white/20 transition text-white"
								title="Làm mới"
							>
								<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
							</button>
							<button
								onClick={onClose}
								className="p-2 rounded-full hover:bg-white/20 transition text-white"
								title="Đóng"
							>
								<X size={20} />
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-h-[60vh] overflow-y-auto p-4">
					{loading && (
						<div className="flex items-center justify-center py-12">
							<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
							<span className="ml-3 text-gray-500">Đang tải...</span>
						</div>
					)}

					{error && (
						<div className="text-center py-12">
							<p className="text-red-500 mb-3">{error}</p>
							<button
								onClick={fetchStaff}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								Thử lại
							</button>
						</div>
					)}

					{!loading && !error && staffList.length === 0 && (
						<div className="text-center py-12">
							<User size={48} className="mx-auto text-gray-300 mb-3" />
							<p className="text-gray-500">Chưa có nhân viên nào</p>
						</div>
					)}

					{!loading && !error && staffList.length > 0 && (
						<div className="space-y-3">
							{staffList.map((staff) => (
								<div
									key={staff._id}
									className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
										staff.isOnline
											? 'border-green-200 bg-green-50/50 hover:bg-green-50 hover:shadow-md'
											: 'border-gray-200 bg-gray-50/50 opacity-60'
									}`}
								>
									{/* Avatar */}
									<div className="relative flex-shrink-0">
										<div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
											{staff.avatar ? (
												<img
													src={staff.avatar}
													alt={staff.fullName}
													className="w-full h-full object-cover"
												/>
											) : (
												<span className="text-xl font-bold text-white">
													{(staff.fullName || 'U').charAt(0).toUpperCase()}
												</span>
											)}
										</div>
										{/* Online indicator */}
										<div
											className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
												staff.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
											}`}
										></div>
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<h3 className="font-semibold text-gray-900 truncate">
											{staff.fullName}
										</h3>
										<div className="flex items-center gap-2 mt-1">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
													ROLE_COLORS[staff.role] || 'bg-gray-100 text-gray-600'
												}`}
											>
												{ROLE_LABELS[staff.role] || staff.role}
											</span>
											<span className="flex items-center gap-1 text-xs text-gray-500">
												{staff.isOnline ? (
													<>
														<Wifi size={12} className="text-emerald-500" />
														<span className="text-emerald-600 font-medium">Đang trực</span>
													</>
												) : (
													<>
														<WifiOff size={12} />
														<span>Ngoại tuyến</span>
													</>
												)}
											</span>
										</div>
									</div>

									{/* Call buttons — only show for online staff */}
									{staff.isOnline && (
										<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={() => handleSelect(staff, 'voice')}
												className="p-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-110"
												title={`Gọi thoại cho ${staff.fullName}`}
											>
												<Phone size={18} />
											</button>
											<button
												onClick={() => handleSelect(staff, 'video')}
												className="p-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-110"
												title={`Gọi video cho ${staff.fullName}`}
											>
												<Video size={18} />
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
					<p className="text-xs text-gray-400 text-center">
						Chọn nhân viên đang trực để bắt đầu cuộc gọi tư vấn
					</p>
				</div>
			</div>
		</div>
	)
}
// test