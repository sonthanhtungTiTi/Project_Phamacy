import { useEffect, useState } from 'react'
import type { AuthUser } from '../../services/auth.service'

interface HeaderProps {
	authUser: AuthUser | null
	onOpenAuth: () => void
	onOpenProfile: () => void
	onLogout: () => void
	searchKeyword?: string
	onSearchKeywordChange?: (keyword: string) => void
}

const topBanners = [
	{
		image: 'https://img.tgdd.vn/imgt/ankhang/f_webp,fit_outside,quality_95/https://cdnv2.tgdd.vn/mwg-static/ankhang/Banner/56/ad/56ad38ac332d8eec561f5c5031a9f777.png',
		href: '/chuong-trinh/online-gia-re',
		backgroundColor: '#008f11',
	},
	{
		image: 'https://img.tgdd.vn/imgt/ankhang/f_webp,fit_outside,quality_95/https://cdnv2.tgdd.vn/mwg-static/ankhang/Banner/e9/e3/e9e306e744794670bbb16729d59c817f.png',
		href: 'https://www.nhathuocankhang.com/tin-khuyen-mai/tai-app-an-khang-nhan-ngay-uu-dai-1582862',
		backgroundColor: '#6fde75',
	},
	{
		image: 'https://img.tgdd.vn/imgt/ankhang/f_webp,fit_outside,quality_95/https://cdnv2.tgdd.vn/mwg-static/ankhang/Banner/a6/db/a6db526821ac95ea9865384d6f2a142c.png',
		href: 'https://www.nhathuocankhang.com/tin-khuyen-mai/mwg-shop-lich-sale-uu-dai-dac-biet-ton-vinh-phai-1590203',
		backgroundColor: '#acfeac',
	},
]

function Header({
	authUser,
	onOpenAuth,
	onOpenProfile,
	onLogout,
	searchKeyword = '',
	onSearchKeywordChange,
}: HeaderProps) {
	const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

	useEffect(() => {
		const interval = window.setInterval(() => {
			setCurrentBannerIndex((prev) => (prev + 1) % topBanners.length)
		}, 4500)

		return () => {
			window.clearInterval(interval)
		}
	}, [])

	return (
		<header className="relative z-[988] w-full bg-white">
			<div className="bg-[#22b245]">
				<div className="overflow-hidden">
					<div
						className="flex w-full transition-transform duration-700 ease-in-out"
						style={{ transform: `translate3d(-${currentBannerIndex * 100}%, 0px, 0px)` }}
					>
						{topBanners.map((banner) => (
							<a
								key={banner.image}
								href={banner.href}
								target={banner.href.startsWith('http') ? '_blank' : undefined}
								rel={banner.href.startsWith('http') ? 'noopener noreferrer' : undefined}
								className="block h-[60px] w-full flex-shrink-0"
								style={{ backgroundColor: banner.backgroundColor }}
							>
								<img
									src={banner.image}
									alt="banner"
									className="mx-auto h-[60px] w-full max-w-[1920px] object-cover"
								/>
							</a>
						))}
					</div>
				</div>
			</div>

			<div className="sticky top-0 z-[989] bg-[#2eaf42] text-white shadow-[0_6px_18px_rgba(12,90,31,0.2)]">
				<div className="mx-auto max-w-[1200px] px-4">
					<div className="flex items-center justify-between pt-4">
						<div className="flex items-center text-sm">
							<span className="mr-2">📍</span>
							<span className="text-white/90">Giao hang tai:</span>
							<span className="ml-1 font-semibold">Ho Chi Minh</span>
						</div>
						<div className="text-sm">
							<span className="text-white/95">📱 Tai app An Khang - Freeship moi don - Uu dai den 200.000d</span>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4 pb-4 pt-2">
						<a href="/" className="flex h-10 w-[154px] items-center text-2xl font-black leading-none">
							<span>NHA THUOC</span>
							<span className="ml-1 text-[#dfffa1]">AN KHANG</span>
						</a>

						<div className="relative flex h-10 min-w-[320px] flex-1 items-center rounded-xl bg-white pl-10 pr-10">
							<span className="absolute left-3 text-slate-500">🔎</span>
							<input
								type="text"
								placeholder="Tim theo ten thuoc, benh..."
								value={searchKeyword}
								onChange={(event) => onSearchKeywordChange?.(event.target.value)}
								className="w-full bg-transparent text-sm text-slate-700 outline-none"
							/>
							<span className="absolute right-3 text-slate-500">📷</span>
						</div>

						<button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1f9542]">
							Tra gia thuoc
						</button>

						<button className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700/30">
							Gio thuoc
						</button>

						{authUser ? (
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={onOpenProfile}
									className="flex items-center rounded-xl px-2 py-1 text-white transition hover:bg-green-700/30"
								>
									<span className="mr-2">👤</span>
									<span className="max-w-[120px] truncate">{authUser.fullName}</span>
								</button>
								<button
									type="button"
									onClick={onLogout}
									className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#1f9542]"
								>
									Dang xuat
								</button>
							</div>
						) : (
							<button
								type="button"
								onClick={onOpenAuth}
								className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700/30"
							>
								Dang nhap
							</button>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header
