import { useState } from 'react'
import toast from 'react-hot-toast'
import { updateProfile, type AuthUser } from '../services/auth.service'

interface ProfileProps {
	user: AuthUser
	onClose: () => void
	onSave: (updatedUser: AuthUser) => void
}

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

function Profile({ user, onClose, onSave }: ProfileProps) {
	const [fullName, setFullName] = useState(user.fullName || '')
	const [email, setEmail] = useState(user.email || '')
	const [phone, setPhone] = useState(user.phone || '')
	const [avatar, setAvatar] = useState(user.avatar || '')
	const [address, setAddress] = useState(user.address || '')
	const [dateOfBirth, setDateOfBirth] = useState(toDateInputValue(user.dateOfBirth))
	const [isSaving, setIsSaving] = useState(false)

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!fullName || !email) {
			toast.error('Vui long nhap day du ho ten va email')
			return
		}

		const submitProfile = async () => {
			try {
				setIsSaving(true)

				const updatedUser = await updateProfile(user.id, {
					fullName: fullName.trim(),
					email: email.trim().toLowerCase(),
					phone: phone.trim(),
					avatar: avatar.trim(),
					address: address.trim(),
					dateOfBirth,
				})

				onSave(updatedUser)
				onClose()
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
		<div className="fixed inset-0 z-[2000] overflow-y-auto bg-slate-950/45 px-4 py-8">
			<div className="mx-auto w-full max-w-3xl rounded-3xl bg-white shadow-[0_24px_65px_rgba(7,44,18,0.28)]">
				<div className="flex items-center justify-between rounded-t-3xl bg-[linear-gradient(120deg,#39b54a,#6adf7d)] px-6 py-5 text-white">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Thong tin ca nhan</p>
						<h2 className="mt-1 text-3xl font-black">Profile tai khoan</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-white"
					>
						x
					</button>
				</div>

				<div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[240px_1fr]">
					<aside className="rounded-2xl bg-[#f6faf6] p-4">
						<img
							src={avatar || 'https://ui-avatars.com/api/?name=User'}
							alt={fullName}
							className="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
						/>
						<h3 className="mt-3 text-center text-lg font-bold text-slate-800">{fullName || 'Khach hang'}</h3>
						<p className="text-center text-sm text-slate-500">{email || 'Chua co email'}</p>
						<div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-slate-500">
							<p>ID: {user.id}</p>
							<p className="mt-1">Vai tro: {user.role}</p>
							<p className="mt-1">Dang nhap: {user.provider}</p>
						</div>
					</aside>

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
								value={address}
								onChange={(event) => setAddress(event.target.value)}
								className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
							/>
						</label>

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
							<button
								type="button"
								onClick={onClose}
								className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
							>
								Dong
							</button>
							<button
								type="submit"
								disabled={isSaving}
								className="h-10 rounded-xl bg-[linear-gradient(120deg,#25a53e,#47c95a)] px-5 text-sm font-bold text-white"
							>
								{isSaving ? 'Dang luu...' : 'Luu thay doi'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Profile
