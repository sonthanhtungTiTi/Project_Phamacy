import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import toast from 'react-hot-toast'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import OtpVerify from '../components/ui/otp-verify'
import {
	loginWithForm,
	loginWithGoogle,
	registerWithForm,
	type AuthUser,
} from '../services/auth.service'

interface LoginAndRegisterProps {
	onClose: () => void
	onAuthSuccess?: (user: AuthUser) => void
}

function LoginAndRegister({ onClose, onAuthSuccess }: LoginAndRegisterProps) {
	const [isRegisterMode, setIsRegisterMode] = useState(false)
	const [isForgotMode, setIsForgotMode] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [fullName, setFullName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)

	const handleAuthSuccess = (user: AuthUser, accessToken: string) => {
		localStorage.setItem('clientAccessToken', accessToken)
		localStorage.setItem('clientUser', JSON.stringify(user))
		toast.success('Dang nhap thanh cong')
		onAuthSuccess?.(user)
		onClose()
	}

	const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
		const idToken = credentialResponse.credential

		if (!idToken) {
			toast.error('Khong lay duoc idToken tu Google')
			return
		}

		try {
			setIsGoogleLoading(true)
			const result = await loginWithGoogle(idToken)
			handleAuthSuccess(result.user, result.accessToken)
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Dang nhap Google that bai')
		} finally {
			setIsGoogleLoading(false)
		}
	}

	const handleSubmitLocalAuth = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const submitForm = async () => {
			try {
				setIsSubmitting(true)

				if (isRegisterMode) {
					if (!fullName || !phone || !email || !password || !confirmPassword) {
						throw new Error('Vui long nhap day du thong tin dang ky')
					}

					if (password !== confirmPassword) {
						throw new Error('Mat khau nhap lai khong khop')
					}

					const result = await registerWithForm({
						fullName,
						email,
						phone,
						password,
					})

					toast.success('Dang ky tai khoan thanh cong')
					handleAuthSuccess(result.user, result.accessToken)
					return
				}

				if (!phone || !password) {
					throw new Error('Vui long nhap so dien thoai va mat khau')
				}

				const result = await loginWithForm({
					phoneOrEmail: phone,
					password,
				})

				handleAuthSuccess(result.user, result.accessToken)
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Dang nhap that bai')
			} finally {
				setIsSubmitting(false)
			}
		}

		void submitForm()
	}

	return (
		<div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
			<div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_70px_rgba(7,44,18,0.28)]">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
				>
					x
				</button>

				<div className="bg-[linear-gradient(120deg,#39b54a,#6adf7d)] px-6 pb-7 pt-8 text-white">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">Nha thuoc An Khang</p>
					<h2 className="mt-3 text-3xl font-black leading-tight">
						{isForgotMode ? 'Khoi phuc mat khau' : isRegisterMode ? 'Tao tai khoan moi' : 'Chao mung ban quay lai'}
					</h2>
					<p className="mt-2 text-sm text-white/85">
						{isForgotMode
							? 'Nhap email de nhan OTP va xac nhan khoi phuc mat khau.'
							: isRegisterMode
								? 'Dang ky nhanh de theo doi don hang va uu dai ca nhan.'
								: 'Dang nhap de xem lich su mua thuoc va uu dai rieng cho ban.'}
					</p>
				</div>

				<div className="px-6 pb-7 pt-5">
					{isForgotMode ? (
						<OtpVerify
							initialEmail={email}
							onBack={() => setIsForgotMode(false)}
							onVerified={() => setIsForgotMode(false)}
						/>
					) : (
						<>
							<div className="mb-5 grid grid-cols-2 rounded-xl bg-[#f2f6f3] p-1">
								<button
									type="button"
									onClick={() => setIsRegisterMode(false)}
									className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
										!isRegisterMode ? 'bg-white text-[#1f9542] shadow-sm' : 'text-slate-500'
									}`}
								>
									Dang nhap
								</button>
								<button
									type="button"
									onClick={() => setIsRegisterMode(true)}
									className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
										isRegisterMode ? 'bg-white text-[#1f9542] shadow-sm' : 'text-slate-500'
									}`}
								>
									Dang ky
								</button>
							</div>

							<form className="space-y-3" onSubmit={handleSubmitLocalAuth}>
								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">So dien thoai</span>
									<input
										type="tel"
										value={phone}
										onChange={(event) => setPhone(event.target.value)}
										placeholder="Nhap so dien thoai"
										className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
									/>
								</label>

								{isRegisterMode && (
									<label className="block">
										<span className="mb-1 block text-sm font-medium text-slate-600">Ho va ten</span>
										<input
											type="text"
											value={fullName}
											onChange={(event) => setFullName(event.target.value)}
											placeholder="Nhap ho va ten"
											className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
										/>
									</label>
								)}

								{isRegisterMode && (
									<label className="block">
										<span className="mb-1 block text-sm font-medium text-slate-600">Email</span>
										<input
											type="email"
											value={email}
											onChange={(event) => setEmail(event.target.value)}
											placeholder="Nhap email"
											className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#72d27a]"
										/>
									</label>
								)}

								<label className="block">
									<span className="mb-1 block text-sm font-medium text-slate-600">Mat khau</span>
									<div className="relative">
										<input
											type={showPassword ? 'text' : 'password'}
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											placeholder={isRegisterMode ? 'Tao mat khau moi' : 'Nhap mat khau'}
											className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none transition focus:border-[#72d27a]"
										/>
										<button
											type="button"
											onClick={() => setShowPassword((current) => !current)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
											aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
										>
											{showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
										</button>
									</div>
								</label>

								{!isRegisterMode && (
									<div className="flex justify-end">
										<button
											type="button"
											onClick={() => setIsForgotMode(true)}
											className="text-xs font-semibold text-[#1f9542] hover:underline"
										>
											Quen mat khau?
										</button>
									</div>
								)}

								{isRegisterMode && (
									<label className="block">
										<span className="mb-1 block text-sm font-medium text-slate-600">Nhap lai mat khau</span>
										<div className="relative">
											<input
												type={showConfirmPassword ? 'text' : 'password'}
												value={confirmPassword}
												onChange={(event) => setConfirmPassword(event.target.value)}
												placeholder="Nhap lai mat khau"
												className="h-11 w-full rounded-xl border border-slate-200 px-4 pr-12 text-sm outline-none transition focus:border-[#72d27a]"
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword((current) => !current)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
												aria-label={showConfirmPassword ? 'An nhap lai mat khau' : 'Hien nhap lai mat khau'}
											>
												{showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
											</button>
										</div>
									</label>
								)}

								<button
									type="submit"
									disabled={isSubmitting}
									className="mt-1 h-11 w-full rounded-xl bg-[linear-gradient(120deg,#25a53e,#47c95a)] text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,165,62,0.28)] transition hover:brightness-105"
								>
									{isSubmitting ? 'Dang xu ly...' : isRegisterMode ? 'Tao tai khoan' : 'Dang nhap'}
								</button>

								<div className="flex items-center gap-3 py-1">
									<span className="h-px flex-1 bg-slate-200" />
									<span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Hoac</span>
									<span className="h-px flex-1 bg-slate-200" />
								</div>

								<div className="flex justify-center rounded-xl border border-slate-200 bg-white py-2">
									<GoogleLogin
										onSuccess={handleGoogleSuccess}
										onError={() => toast.error('Dang nhap Google that bai')}
										text={isRegisterMode ? 'signup_with' : 'signin_with'}
										shape="pill"
										theme="outline"
										size="large"
										width="300"
									/>
								</div>

								{isGoogleLoading && <p className="text-sm text-slate-500">Dang xu ly Google...</p>}
							</form>

							<div className="mt-4 text-center text-sm text-slate-500">
								{isRegisterMode ? 'Da co tai khoan?' : 'Chua co tai khoan?'}{' '}
								<button
									type="button"
									onClick={() => setIsRegisterMode((current) => !current)}
									className="font-semibold text-[#1f9542]"
								>
									{isRegisterMode ? 'Dang nhap ngay' : 'Dang ky ngay'}
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default LoginAndRegister
