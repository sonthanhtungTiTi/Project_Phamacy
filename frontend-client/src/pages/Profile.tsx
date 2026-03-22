import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { updateProfile, type AuthUser } from '../services/auth.service'
import { useAddress } from '../hooks/useAddress'
import { fetchProvinceV1ByCode, fetchProvincesV1 } from '../services/provincesApi.service'
import type { DistrictV1, ProvinceV1, WardV1 } from '../types/Province'

interface ProfileProps {
	user: AuthUser
	onClose?: () => void
	onSave: (updatedUser: AuthUser) => void
	mode?: 'modal' | 'page'
	initialSection?: ProfileSectionKey
}

type ProfileSectionKey = 'orders' | 'voucher' | 'profile' | 'address' | 'notifications' | 'policy'

const toDateInputValue = (value?: string) => {
	if (!value) {
		return ''
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value
	}

	const parsedDate = new Date(value)

	if (Number.isNaN(parsedDate.getTime())) {
		return ''
	}

	return parsedDate.toISOString().slice(0, 10)
}

function Profile({ user, onClose, onSave, mode = 'modal', initialSection = 'orders' }: ProfileProps) {
	const { addresses, defaultAddress, addAddress, editAddress, chooseDefaultAddress } = useAddress()

	const [fullName, setFullName] = useState(user.fullName || '')
	const [email, setEmail] = useState(user.email || '')
	const [phone, setPhone] = useState(user.phone || '')
	const [avatar, setAvatar] = useState(user.avatar || '')
	const [address, setAddress] = useState(user.address || '')
	const [dateOfBirth, setDateOfBirth] = useState(toDateInputValue(user.dateOfBirth))
	const [recipientName, setRecipientName] = useState(defaultAddress?.recipientName || user.fullName || '')
	const [recipientPhone, setRecipientPhone] = useState(defaultAddress?.phone || user.phone || '')
	const [street, setStreet] = useState(defaultAddress?.street || '')
	const [addressNote, setAddressNote] = useState(defaultAddress?.note || '')
	const [label, setLabel] = useState<'home' | 'office' | 'other'>(defaultAddress?.label || 'home')
	const [provinceCode, setProvinceCode] = useState(defaultAddress?.provinceCode || '')
	const [districtCode, setDistrictCode] = useState(defaultAddress?.districtCode || '')
	const [wardCode, setWardCode] = useState(defaultAddress?.wardCode || '')
	const [provinces, setProvinces] = useState<ProvinceV1[]>([])
	const [districts, setDistricts] = useState<DistrictV1[]>([])
	const [wards, setWards] = useState<WardV1[]>([])
	const [isLoadingAddressData, setIsLoadingAddressData] = useState(false)
	const [selectedAddressId, setSelectedAddressId] = useState('')
	const [addressFormMode, setAddressFormMode] = useState<'create' | 'edit'>('create')
	const [isAddressDefault, setIsAddressDefault] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [activeSection, setActiveSection] = useState<ProfileSectionKey>(initialSection)
	const isAddressAutoSelectedRef = useRef(false)
	const isPageMode = mode === 'page'

	const selectedAddress = useMemo(
		() => addresses.find((item) => item.id === selectedAddressId) || null,
		[addresses, selectedAddressId],
	)

	const selectedProvince = useMemo(
		() => provinces.find((item) => String(item.code) === String(provinceCode)) || null,
		[provinceCode, provinces],
	)

	const selectedDistrict = useMemo(
		() => districts.find((item) => String(item.code) === String(districtCode)) || null,
		[districtCode, districts],
	)

	const selectedWard = useMemo(
		() => wards.find((item) => String(item.code) === String(wardCode)) || null,
		[wardCode, wards],
	)

	const selectedAddressText = useMemo(() => {
		const parts = [street.trim(), selectedWard?.name || '', selectedDistrict?.name || '', selectedProvince?.name || '']
		return parts.filter(Boolean).join(', ')
	}, [street, selectedWard, selectedDistrict, selectedProvince])

	useEffect(() => {
		if (!isAddressAutoSelectedRef.current && !selectedAddressId && defaultAddress?.id) {
			setSelectedAddressId(defaultAddress.id)
			setAddressFormMode('edit')
			isAddressAutoSelectedRef.current = true
		}
	}, [defaultAddress?.id, selectedAddressId])

	useEffect(() => {
		if (selectedAddress) {
			setRecipientName(selectedAddress.recipientName || user.fullName || '')
			setRecipientPhone(selectedAddress.phone || user.phone || '')
			setStreet(selectedAddress.street || '')
			setAddressNote(selectedAddress.note || '')
			setLabel(selectedAddress.label || 'home')
			setProvinceCode(selectedAddress.provinceCode || '')
			setDistrictCode(selectedAddress.districtCode || '')
			setWardCode(selectedAddress.wardCode || '')
			setIsAddressDefault(Boolean(selectedAddress.isDefault))
			return
		}

		setRecipientName(user.fullName || '')
		setRecipientPhone(user.phone || '')
		setStreet('')
		setAddressNote('')
		setLabel('home')
		setProvinceCode('')
		setDistrictCode('')
		setWardCode('')
		setIsAddressDefault(addresses.length === 0)
	}, [selectedAddress, user.fullName, user.phone, addresses.length])

	useEffect(() => {
		const loadProvinces = async () => {
			try {
				setIsLoadingAddressData(true)
				const provinceList = await fetchProvincesV1(1)
				setProvinces(provinceList)
			} catch {
				setProvinces([])
			} finally {
				setIsLoadingAddressData(false)
			}
		}

		void loadProvinces()
	}, [])

	useEffect(() => {
		if (!provinceCode) {
			setDistricts([])
			setDistrictCode('')
			setWards([])
			setWardCode('')
			return
		}

		const loadProvinceDetail = async () => {
			try {
				setIsLoadingAddressData(true)
				const provinceData = await fetchProvinceV1ByCode(provinceCode, 3)
				const districtList = provinceData.districts || []
				setDistricts(districtList)

				const districtExists = districtList.some((item) => String(item.code) === String(districtCode))
				if (!districtExists) {
					setDistrictCode('')
					setWards([])
					setWardCode('')
				}
			} catch {
				setDistricts([])
				setDistrictCode('')
				setWards([])
				setWardCode('')
			} finally {
				setIsLoadingAddressData(false)
			}
		}

		void loadProvinceDetail()
	}, [provinceCode, districtCode])

	useEffect(() => {
		if (!districtCode) {
			setWards([])
			setWardCode('')
			return
		}

		const district = districts.find((item) => String(item.code) === String(districtCode))
		const wardList = district?.wards || []
		setWards(wardList)

		const wardExists = wardList.some((item) => String(item.code) === String(wardCode))
		if (!wardExists) {
			setWardCode('')
		}
	}, [districtCode, districts, wardCode])

	const handleCreateNewAddress = () => {
		setAddressFormMode('create')
		setSelectedAddressId('')
		setIsAddressDefault(addresses.length === 0)
	}

	const handleSelectAddressForEdit = (addressId: string) => {
		setAddressFormMode('edit')
		setSelectedAddressId(addressId)
	}

	const handleSetDefaultAddress = async (addressId: string) => {
		try {
			await chooseDefaultAddress(addressId)
			toast.success('Da cap nhat dia chi mac dinh')
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Khong the dat dia chi mac dinh')
		}
	}

	const buildAddressPayload = () => {
		if (!recipientName.trim() || !recipientPhone.trim() || !street.trim() || !selectedProvince || !selectedDistrict || !selectedWard) {
			throw new Error('Vui long nhap day du thong tin dia chi nhan hang')
		}

		return {
			label,
			recipientName: recipientName.trim(),
			phone: recipientPhone.trim(),
			provinceCode: String(selectedProvince.code),
			provinceName: selectedProvince.name,
			districtCode: String(selectedDistrict.code),
			districtName: selectedDistrict.name,
			wardCode: String(selectedWard.code),
			wardName: selectedWard.name,
			street: street.trim(),
			note: addressNote.trim(),
			isDefault: isAddressDefault,
		}
	}

	const handleSaveAddressOnly = async () => {
		try {
			const payload = buildAddressPayload()

			if (addressFormMode === 'edit' && selectedAddressId) {
				if (selectedAddress?.isDefault && !isAddressDefault) {
					throw new Error('Khong the bo mac dinh dia chi hien tai. Hay dat dia chi khac lam mac dinh truoc.')
				}

				await editAddress(selectedAddressId, payload)
				toast.success('Da cap nhat dia chi')
				return
			}

			await addAddress(payload)
			setAddressFormMode('create')
			setSelectedAddressId('')
			toast.success('Da them dia chi moi')
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Luu dia chi that bai')
		}
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!fullName || !email) {
			toast.error('Vui long nhap day du ho ten va email')
			return
		}

		if (!recipientName.trim() || !recipientPhone.trim() || !street.trim() || !selectedProvince || !selectedDistrict || !selectedWard) {
			toast.error('Vui long chon day du thong tin dia chi nhan hang')
			return
		}

		const submitProfile = async () => {
			try {
				setIsSaving(true)

				const summaryAddress = [street.trim(), selectedWard.name, selectedDistrict.name, selectedProvince.name]
					.filter(Boolean)
					.join(', ')

				const updatedUserPromise = updateProfile(user.id, {
					fullName: fullName.trim(),
					email: email.trim().toLowerCase(),
					phone: phone.trim(),
					avatar: avatar.trim(),
					address: summaryAddress || address.trim(),
					dateOfBirth,
				})

				if (selectedAddress?.isDefault && !isAddressDefault) {
					throw new Error('Khong the bo mac dinh dia chi hien tai. Hay dat dia chi khac lam mac dinh truoc.')
				}

				if (addressFormMode === 'edit' && selectedAddressId) {
					const payload = buildAddressPayload()
					await editAddress(selectedAddressId, {
						...payload,
					})
				} else {
					const payload = buildAddressPayload()
					await addAddress(payload)
				}

				const updatedUser = await updatedUserPromise

				onSave(updatedUser)
				onClose?.()
				toast.success('Cap nhat thong tin thanh cong')
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Cap nhat that bai')
			} finally {
				setIsSaving(false)
			}
		}

		void submitProfile()
	}

	return (
		<div className={isPageMode ? 'w-full' : 'fixed inset-0 z-[2000] overflow-y-auto bg-slate-950/45 px-4 py-8'}>
			<div className={isPageMode ? 'w-full rounded-3xl bg-white shadow-sm' : 'mx-auto w-full max-w-3xl rounded-3xl bg-white shadow-[0_24px_65px_rgba(7,44,18,0.28)]'}>
				<div className="flex items-center justify-between rounded-t-3xl bg-[linear-gradient(120deg,#39b54a,#6adf7d)] px-6 py-5 text-white">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Thông tin cá nhân</p>
						<h2 className="mt-1 text-3xl font-black">Profile tài khoản</h2>
					</div>
					{!isPageMode && onClose && (
						<button
							type="button"
							onClick={onClose}
							className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-white"
						>
							x
						</button>
					)}
				</div>

				<div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[240px_1fr]">
					<aside className="rounded-2xl bg-[#f6faf6] p-4">
						<img
							src={avatar || 'https://ui-avatars.com/api/?name=User'}
							alt={fullName}
							className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
						/>
						<h3 className="mt-3 text-center text-lg font-bold text-slate-800">{fullName || 'Khach hang'}</h3>
						<p className="text-center text-sm text-slate-500">{phone || 'Chua co so dien thoai'}</p>

						<nav className="mt-4 space-y-1">
							{[
								{ key: 'orders', label: 'Đơn hàng của tôi' },
								{ key: 'voucher', label: 'Vi voucher' },
								{ key: 'profile', label: 'Thông tin cá nhân' },
								{ key: 'address', label: 'Địa chỉ nhận hàng' },
								{ key: 'notifications', label: 'Thông báo' },
								{ key: 'policy', label: 'Chính sách An Khang' },
							].map((item) => {
								const isActive = activeSection === item.key

								return (
									<button
										key={item.key}
										type="button"
										onClick={() => setActiveSection(item.key as ProfileSectionKey)}
										className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
											isActive ? 'bg-[#e8f8ec] text-[#1f9542]' : 'text-slate-700 hover:bg-white'
										}`}
									>
										{item.label}
									</button>
								)
							})}
						</nav>
					</aside>

					{activeSection === 'profile' ? (
						<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="block">
								<span className="mb-1 block text-sm font-medium text-slate-600">Ho va ten</span>
								<input
									type="text"
									value={fullName}
									onChange={(event) => setFullName(event.target.value)}
									className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
								/>
							</label>

							<label className="block">
								<span className="mb-1 block text-sm font-medium text-slate-600">So dien thoai</span>
								<input
									type="tel"
									value={phone}
									onChange={(event) => setPhone(event.target.value)}
									className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
								/>
							</label>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<label className="block">
								<span className="mb-1 block text-sm font-medium text-slate-600">Email</span>
								<input
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
								/>
							</label>

							<label className="block">
								<span className="mb-1 block text-sm font-medium text-slate-600">Ngay sinh</span>
								<input
									type="date"
									value={dateOfBirth}
									onChange={(event) => setDateOfBirth(event.target.value)}
									className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
								/>
							</label>
						</div>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-600">Dia chi</span>
							<input
								type="text"
								value={selectedAddressText || address}
								onChange={(event) => setAddress(event.target.value)}
								className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
							/>
						</label>

						<div className="rounded-2xl border border-[#d8efdc] bg-[#f7fcf8] p-4">
							<p className="mb-3 text-sm font-bold text-[#1f9542]">Dia chi nhan hang (API Tinh/Huyen/Xa)</p>

							<div className="mb-4 space-y-2 rounded-xl bg-white p-3">
								<div className="flex items-center justify-between gap-2">
									<p className="text-sm font-semibold text-slate-700">Dia chi da luu</p>
									<button
										type="button"
										onClick={handleCreateNewAddress}
										className="rounded-lg border border-[#86c790] px-3 py-1.5 text-xs font-semibold text-[#1f9542]"
									>
										+ Them dia chi moi
									</button>
								</div>

								<p className="text-xs text-slate-500">
									Che do: {addressFormMode === 'edit' ? 'Dang sua dia chi da chon' : 'Dang tao dia chi moi'}
								</p>

								{addresses.length === 0 && <p className="text-xs text-slate-500">Chua co dia chi nao.</p>}

								{addresses.map((item) => (
									<div key={item.id} className="rounded-lg border border-slate-200 p-2">
										<p className="text-xs font-semibold text-slate-700">
											{item.recipientName} - {item.phone}
										</p>
										<p className="mt-1 text-xs text-slate-600">{item.fullAddress}</p>
										<div className="mt-2 flex flex-wrap gap-2">
											<button
												type="button"
												onClick={() => handleSelectAddressForEdit(item.id)}
												className={`rounded px-2 py-1 text-xs font-semibold ${
													selectedAddressId === item.id
														? 'bg-[#e9f9ed] text-[#1f9542]'
														: 'bg-slate-100 text-slate-700'
												}`}
											>
												Chon sua
											</button>

											{!item.isDefault && (
												<button
													type="button"
													onClick={() => void handleSetDefaultAddress(item.id)}
													className="rounded bg-[#fef3c7] px-2 py-1 text-xs font-semibold text-[#b45309]"
												>
													Dat mac dinh
												</button>
											)}

											{item.isDefault && (
												<span className="rounded bg-[#dcfce7] px-2 py-1 text-xs font-semibold text-[#15803d]">Mac dinh</span>
											)}
										</div>
									</div>
								))}
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Nguoi nhan</span>
									<input
										type="text"
										value={recipientName}
										onChange={(event) => setRecipientName(event.target.value)}
										className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
									/>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">So dien thoai nhan hang</span>
									<input
										type="tel"
										value={recipientPhone}
										onChange={(event) => setRecipientPhone(event.target.value)}
										className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
									/>
								</label>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Tinh/Thanh</span>
									<select
										value={provinceCode}
										onChange={(event) => setProvinceCode(event.target.value)}
										className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#72d27a]"
									>
										<option value="">Chon tinh/thanh</option>
										{provinces.map((item) => (
											<option key={item.code} value={String(item.code)}>
												{item.name}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Quan/Huyen</span>
									<select
										value={districtCode}
										onChange={(event) => setDistrictCode(event.target.value)}
										disabled={!provinceCode}
										className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#72d27a] disabled:bg-slate-100"
									>
										<option value="">Chon quan/huyen</option>
										{districts.map((item) => (
											<option key={item.code} value={String(item.code)}>
												{item.name}
											</option>
										))}
									</select>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Phuong/Xa</span>
									<select
										value={wardCode}
										onChange={(event) => setWardCode(event.target.value)}
										disabled={!districtCode}
										className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#72d27a] disabled:bg-slate-100"
									>
										<option value="">Chon phuong/xa</option>
										{wards.map((item) => (
											<option key={item.code} value={String(item.code)}>
												{item.name}
											</option>
										))}
									</select>
								</label>
							</div>

							<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">So nha, ten duong</span>
									<input
										type="text"
										value={street}
										onChange={(event) => setStreet(event.target.value)}
										className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
									/>
								</label>

								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Loai dia chi</span>
									<select
										value={label}
										onChange={(event) => setLabel(event.target.value as 'home' | 'office' | 'other')}
										className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#72d27a]"
									>
										<option value="home">Nha rieng</option>
										<option value="office">Van phong</option>
										<option value="other">Khac</option>
									</select>
								</label>
							</div>

							<label className="mt-4 block">
								<span className="mb-1 block text-sm font-medium text-slate-600">Ghi chu giao hang</span>
								<input
									type="text"
									value={addressNote}
									onChange={(event) => setAddressNote(event.target.value)}
									className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
								/>
							</label>

							<label className="mt-3 flex items-center gap-2">
								<input
									type="checkbox"
									checked={isAddressDefault}
									onChange={(event) => setIsAddressDefault(event.target.checked)}
									className="h-4 w-4 rounded border-slate-300 text-[#2ea847] focus:ring-[#7bd58a]"
								/>
								<span className="text-sm text-slate-700">Dat dia chi nay lam mac dinh</span>
							</label>

							<div className="mt-3 flex justify-end">
								<button
									type="button"
									onClick={() => void handleSaveAddressOnly()}
									className="h-10 rounded-xl border border-[#86c790] bg-white px-4 text-sm font-semibold text-[#1f9542]"
								>
									{addressFormMode === 'edit' ? 'Cap nhat dia chi' : 'Them dia chi moi'}
								</button>
							</div>

							{isLoadingAddressData && <p className="mt-2 text-xs text-slate-500">Dang tai du lieu dia chi...</p>}
						</div>

						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-600">URL avatar</span>
							<input
								type="url"
								value={avatar}
								onChange={(event) => setAvatar(event.target.value)}
								placeholder="https://..."
								className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
							/>
						</label>

						<div className="flex flex-wrap items-center justify-end gap-3 pt-2">
							{!isPageMode && onClose && (
								<button
									type="button"
									onClick={onClose}
									className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
								>
									Đóng
								</button>
							)}
							<button
								type="submit"
								disabled={isSaving}
								className="h-10 rounded-xl bg-[linear-gradient(120deg,#25a53e,#47c95a)] px-5 text-sm font-bold text-white"
							>
								{isSaving ? 'Dang luu...' : 'Luu thay doi'}
							</button>
						</div>
						</form>
					) : (
						<section className="rounded-2xl border border-slate-200 bg-white p-5">
							<h3 className="text-lg font-bold text-slate-800">
								{activeSection === 'orders' && 'Đơn hàng của tôi'}
								{activeSection === 'voucher' && 'Vi voucher'}
								{activeSection === 'address' && 'Địa chỉ nhận hàng'}
								{activeSection === 'notifications' && 'Thông báo'}
								{activeSection === 'policy' && 'Chính sách An Khang'}
							</h3>
							<p className="mt-2 text-sm text-slate-600">
								Tính năng này giữ nguyên luồng cũ. Bấm mục <strong>Thông tin cá nhân</strong> để mở lại form <strong>Profile tài khoản</strong>.
							</p>
							<button
								type="button"
								onClick={() => setActiveSection('profile')}
								className="mt-4 h-10 rounded-xl bg-[linear-gradient(120deg,#25a53e,#47c95a)] px-4 text-sm font-bold text-white"
							>
								Mở form Profile tài khoản
							</button>
						</section>
					)}
				</div>
			</div>
		</div>
	)
}

export default Profile
