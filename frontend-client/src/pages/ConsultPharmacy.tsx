interface ConsultPharmacyProps {
	onBackHome?: () => void
}

function ConsultPharmacy({ onBackHome }: ConsultPharmacyProps) {
	const openZaloChat = () => {
		window.open('https://zalo.me/0398668953', '_blank', 'noopener,noreferrer')
	}

	const goHome = () => {
		if (onBackHome) {
			onBackHome()
			return
		}

		window.history.pushState({}, '', '/')
		window.dispatchEvent(new PopStateEvent('popstate'))
	}

	return (
		<div className="min-h-screen bg-[#eceff3] py-6">
			<header className="mx-auto mb-4 flex w-[min(1120px,95vw)] items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
				<h1 className="text-[44px] font-black leading-none text-[#1368e8]">Zalo</h1>
				<p className="text-lg text-slate-700">Ngon ngu: <span className="font-semibold text-[#1368e8]">Tieng Viet</span></p>
			</header>

			<main className="mx-auto grid w-[min(1120px,95vw)] grid-cols-1 gap-6 rounded-2xl bg-[#f6f7f9] p-6 shadow-sm lg:grid-cols-[1fr_300px]">
				<section>
					<div className="mb-7 flex flex-wrap items-start gap-5">
						<span className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
							<img
								src="https://res.cloudinary.com/devdnfoyh/image/upload/v1773639699/logo_ms0x2m.png"
								alt="Avatar"
								className="h-full w-full object-cover"
							/>
						</span>

						<div className="flex-1">
							<div className="mb-2 flex items-center gap-2">
								<h2 className="text-4xl font-extrabold text-slate-900">Nha Thuoc T&Q</h2>
								<span className="inline-grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-[#ffda15] to-[#c69b01] text-white">
									✓
								</span>
							</div>
							<p className="mb-6 text-3xl text-slate-700">Y te & Duoc pham</p>

							<button
								type="button"
								title="Nhan tin qua Zalo"
								onClick={openZaloChat}
								className="inline-flex h-14 min-w-[240px] items-center justify-center gap-2 rounded-xl bg-[#1368e8] px-8 text-2xl font-semibold text-white hover:bg-[#0e58c5]"
							>
								<span>💬</span>
								<span>Nhan tin</span>
							</button>
						</div>
					</div>

					<div className="rounded-2xl bg-white p-6">
						<h3 className="mb-4 text-4xl font-bold text-slate-900">Thong tin chi tiet</h3>
						<ul className="space-y-4 text-[30px] text-slate-700">
							<li className="flex items-center gap-3">
								<span className="text-slate-500">📞</span>
								<a href="tel:0398668953" className="text-[#1368e8] hover:underline">0398668953</a>
							</li>
							<li className="flex items-center gap-3">
								<span className="text-slate-500">🕘</span>
								<span><mark className="rounded bg-transparent font-semibold text-[#26a06a]">Dang mo cua</mark> • Dong cua luc 22:00</span>
							</li>
							<li className="flex items-center gap-3">
								<span className="text-slate-500">🏠</span>
								<a
									href="https://www.nhathuocankhang.com"
									target="_blank"
									rel="noreferrer"
									className="text-[#1368e8] hover:underline"
								>
									www.nhathuocankhang.com
								</a>
							</li>
						</ul>

						<div className="mt-6 border-t border-slate-200 pt-6 text-[28px] leading-relaxed text-slate-700">
							Nha thuoc An Khang chuyen ban le thuoc, duoc pham, thuc pham chuc nang, thiet bi y te.
							 Dong thoi cung cap thong tin huu ich ve cach phong tri benh, cac bac si, benh vien,
							hoi thao lien quan ve benh thuoc tap doan The Gioi Di Dong.
						</div>
					</div>
				</section>

				<figure className="rounded-2xl bg-white p-5 text-center">
					<div className="mx-auto mb-4 w-full max-w-[260px] overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
						<img
							src="https://res.cloudinary.com/devdnfoyh/image/upload/v1773640568/qr_xcv9ed.jpg"
							alt="QR-Code"
							className="h-auto w-full"
						/>
					</div>
					<figcaption className="text-xl leading-8 text-slate-600">
						Mo Zalo, bam quet QR de quet va xem tren dien thoai
					</figcaption>
				</figure>
			</main>

			<div className="mx-auto mt-5 flex w-[min(1120px,95vw)] justify-start">
				<button
					type="button"
					onClick={goHome}
					className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
				>
					Quay ve trang chu
				</button>
			</div>
		</div>
	)
}

export default ConsultPharmacy
