import { useEffect, useState, type ReactNode } from 'react'
import LoginAndRegister from '../../pages/LoginAndRegister'
import Profile from '../../pages/Profile'
import type { AuthUser } from '../../services/auth.service'
import Footer from './footer'
import Header from './header'

export interface CategoryItem {
	_id: string
	categoryName: string
}

interface PharmacyLayoutProps {
	categories: CategoryItem[]
	selectedCategoryId?: string
	onCategorySelect?: (category: CategoryItem) => void
	hideSidebar?: boolean
	searchKeyword?: string
	onSearchKeywordChange?: (keyword: string) => void
	children: ReactNode
}

function PharmacyLayout({
	categories,
	selectedCategoryId,
	onCategorySelect,
	hideSidebar = false,
	searchKeyword = '',
	onSearchKeywordChange,
	children,
}: PharmacyLayoutProps) {
	const [isAuthOpen, setIsAuthOpen] = useState(false)
	const [isProfileOpen, setIsProfileOpen] = useState(false)
	const [authUser, setAuthUser] = useState<AuthUser | null>(null)

	useEffect(() => {
		const userRaw = localStorage.getItem('clientUser')

		if (!userRaw) {
			setAuthUser(null)
			return
		}

		try {
			setAuthUser(JSON.parse(userRaw) as AuthUser)
		} catch {
			localStorage.removeItem('clientUser')
			setAuthUser(null)
		}
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('clientAccessToken')
		localStorage.removeItem('clientUser')
		setAuthUser(null)
		setIsProfileOpen(false)
	}

	const handleProfileSave = (updatedUser: AuthUser) => {
		localStorage.setItem('clientUser', JSON.stringify(updatedUser))
		setAuthUser(updatedUser)
	}

	return (
		<main className="min-h-screen bg-[#ececec] text-slate-800">
			<Header
				authUser={authUser}
				onOpenAuth={() => setIsAuthOpen(true)}
				onOpenProfile={() => setIsProfileOpen(true)}
				onLogout={handleLogout}
				searchKeyword={searchKeyword}
				onSearchKeywordChange={onSearchKeywordChange}
			/>

			<div className="mx-auto max-w-[1280px]">
				<div className="p-4 md:p-8">
					{hideSidebar ? (
						<section className="space-y-4">{children}</section>
					) : (
						<div className="grid grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
							<aside className="rounded-2xl bg-white p-4 shadow-sm">
								<h2 className="mb-4 text-lg font-bold text-[#23a840]">Danh muc</h2>
								<ul className="space-y-1 text-sm text-slate-700">
									{categories.map((item) => (
										<li key={item._id}>
											<button
												type="button"
												id={`category-${item._id}`}
												data-category-id={item._id}
												onClick={() => onCategorySelect?.(item)}
												className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
													selectedCategoryId === item._id
														? 'bg-[#e9f9ed] font-semibold text-[#1f9542]'
														: 'hover:bg-[#f2fbf4] hover:text-[#1f9542]'
												}`}
											>
												{item.categoryName}
												<span aria-hidden="true">&gt;</span>
											</button>
										</li>
									))}
								</ul>

								<div className="mt-5 rounded-xl bg-[linear-gradient(140deg,#4acb5f,#91dd6a)] p-4 text-white">
									<p className="text-xl font-extrabold">Giam 10%</p>
									<p className="mb-3 text-sm text-white/90">Toi da 50.000d</p>
									<button className="w-full rounded-full bg-white py-2 text-sm font-bold text-[#2ea447]">
										Nhan ma ngay
									</button>
								</div>
							</aside>

							<section className="space-y-4">{children}</section>
						</div>
					)}
				</div>
			</div>

			<Footer />

			{isAuthOpen && (
				<LoginAndRegister
					onClose={() => setIsAuthOpen(false)}
					onAuthSuccess={(user) => setAuthUser(user)}
				/>
			)}

			{isProfileOpen && authUser && (
				<Profile
					user={authUser}
					onClose={() => setIsProfileOpen(false)}
					onSave={handleProfileSave}
				/>
			)}
		</main>
	)
}

export default PharmacyLayout
