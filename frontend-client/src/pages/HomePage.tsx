import { useEffect, useState } from 'react'
import PharmacyLayout, { type CategoryItem } from '../components/layout/layout'
import ProductCard from '../components/ui/product-card'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { getCategories } from '../services/category.service'
import { getProducts, type ProductItem } from '../services/product.service'

const quickActions = [
	{ label: 'Mua thuoc, tu van', icon: 'RX', openConsultPage: true },
	{ label: 'Tu thuoc gia dinh', icon: 'GD' },
	{ label: 'Tra cuu chinh hang', icon: 'CH' },
	{ label: 'Don hang cua toi', icon: 'DH' },
	{ label: 'Dat lich kham benh', icon: 'LK' },
	{ label: 'Kiem tra suc khoe', icon: 'SK' },
	{ label: 'Doi tac nha thuoc', icon: 'DT' },
]

const heroBanners = [
	{
		href: '/chuong-trinh/online-gia-re',
		image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/Banner/2b/8c/2b8c19c32ea305b403c4802c013496be.png',
		alt: 'Mung nam moi Ma Dao',
	},
	{
		href: '/chuong-trinh/flashsale',
		image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/Banner/ad/a9/ada975d94ec04c14c1e19ab03aa27fcc.png',
		alt: 'Tuan le hanh phuc Alfe',
	},
]

const healthNews = [
	{
		id: '1',
		title: '11 tac dung cua dau tay voi suc khoe ban nen biet',
		date: '17/03/2026',
		image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg',
	},
	{
		id: '2',
		title: 'Top 23 kem chong nang pho rong cac bac si da lieu khuyen dung',
		date: '14/03/2026',
		image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg',
	},
	{
		id: '3',
		title: 'Nen mua duong an kieng loai nao cho che do an lanh manh?',
		date: '16/03/2026',
		image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80',
	},
	{
		id: '4',
		title: 'La lot co tac dung gi? Cach dung, lieu dung va tac dung phu',
		date: '15/03/2026',
		image: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1516538/la-lot-la-cay-than-thao-mem-moc-thanh-tung-bui.jpg',
	},
	{
		id: '5',
		title: 'Cam nang kem chong nang pho rong cho da dau va da nhay cam',
		date: '13/03/2026',
		image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg',
	},
	{
		id: '6',
		title: 'Top 21 sua rua mat cho da dau mun duoc khuyen dung',
		date: '12/03/2026',
		image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80',
	},
]

const trustTags = [
	'Cam ket nguon goc',
	'Khong tinh phi cat lieu',
	'Tu van dung thuoc, dung lieu',
	'100% hang chinh hang',
	'Minh bach gia va nguon goc',
]

const extractFirstImage = (images: string) => {
	if (!images) {
		return ''
	}

	return images
		.split(';')
		.map((item) => item.trim())
		.find((item) => item.length > 0) || ''
}

const parsePriceNumber = (price: string) => {
	const digits = String(price).replace(/[^0-9]/g, '')
	return digits ? Number(digits) : 0
}

const formatVnd = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(value)))}đ`

const buildCardMeta = (item: ProductItem) => {
	const currentPrice = parsePriceNumber(item.price)
	const discountPercent = 8 + (Number(item.medicineCode || '0') % 34)
	const divisor = 1 - discountPercent / 100
	const originalPrice = divisor > 0 ? Math.round(currentPrice / divisor) : currentPrice
	const totalCount = 20
	const soldCount = 16 + (Number(item.medicineCode || '0') % 5)

	return {
		imageUrl: extractFirstImage(item.images),
		discountLabel: `-${discountPercent}%`,
		originalPrice: currentPrice > 0 ? formatVnd(originalPrice) : '',
		soldCount,
		totalCount,
	}
}

interface HomePageProps {
	onOpenProductDetail?: (productId: string) => void
	onOpenCategory?: (categoryId: string) => void
	onOpenConsultPage?: () => void
	onOpenHealthNews?: (newsId: string) => void
}

interface CategorySection {
	category: CategoryItem
	products: ProductItem[]
}

function HomePage({ onOpenProductDetail, onOpenCategory, onOpenConsultPage, onOpenHealthNews }: HomePageProps) {
	const [categories, setCategories] = useState<CategoryItem[]>([])
	const [sections, setSections] = useState<CategorySection[]>([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [productError, setProductError] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const debouncedSearchKeyword = useDebouncedValue(searchKeyword.trim())

	const openCategoryPage = (categoryId: string) => {
		if (!categoryId) {
			return
		}

		if (onOpenCategory) {
			onOpenCategory(categoryId)
			return
		}

		window.history.pushState({}, '', `/category/${encodeURIComponent(categoryId)}`)
		window.dispatchEvent(new PopStateEvent('popstate'))
	}

	const openConsultPage = () => {
		if (onOpenConsultPage) {
			onOpenConsultPage()
			return
		}

		window.history.pushState({}, '', '/mua-thuoc-tu-van')
		window.dispatchEvent(new PopStateEvent('popstate'))
	}

	const openHealthNewsPage = (newsId: string) => {
		if (!newsId) {
			return
		}

		if (onOpenHealthNews) {
			onOpenHealthNews(newsId)
			return
		}

		window.history.pushState({}, '', `/ban-tin-suc-khoe/${encodeURIComponent(newsId)}`)
		window.dispatchEvent(new PopStateEvent('popstate'))
	}

	const scrollToCategorySection = (categoryId: string) => {
		if (!categoryId) {
			return
		}

		const target = document.getElementById(`category-section-${categoryId}`)
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
	}

	useEffect(() => {
		const loadProducts = async () => {
			try {
				setIsLoadingProducts(true)
				setProductError('')
				const categoryData = await getCategories()
				setCategories(categoryData)

				if (categoryData.length === 0) {
					setSections([])
					return
				}

				const dataByCategory = await Promise.all(
					categoryData.map(async (category) => {
						const data = await getProducts({
							categoryId: category._id,
							search: debouncedSearchKeyword,
							limit: 4,
						})

						return {
							category,
							products: data.items,
						}
					}),
				)

				setSections(dataByCategory.filter((section) => section.products.length > 0))
			} catch (error) {
				setCategories([])
				setSections([])
				setProductError(error instanceof Error ? error.message : 'Khong the tai danh muc va san pham')
			} finally {
				setIsLoadingProducts(false)
			}
		}

		void loadProducts()
	}, [debouncedSearchKeyword])

	return (
		<PharmacyLayout
			categories={categories}
			onCategorySelect={(category) => openCategoryPage(category._id)}
			searchKeyword={searchKeyword}
			onSearchKeywordChange={setSearchKeyword}
		>
			<div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-3 xl:grid-cols-7">
				{quickActions.map((item) => (
					<article
						key={item.label}
						className="rounded-xl border border-[#e6efe6] bg-[#edf5ed] p-3 text-center"
					>
						<div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#8ce270] to-[#2eaf50] shadow-[0_6px_14px_rgba(22,163,74,0.35)]">
							<span className="grid h-8 w-8 place-items-center rounded-full bg-white/25 text-[11px] font-bold tracking-wide leading-none text-white">
								{item.icon}
							</span>
						</div>
						{item.openConsultPage ? (
							<p
								role="button"
								tabIndex={0}
								onClick={openConsultPage}
								onKeyDown={(event) => {
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault()
										openConsultPage()
									}
								}}
								className="text-sm font-medium text-slate-700 hover:text-[#16a34a]"
							>
								{item.label}
							</p>
						) : (
							<p className="text-sm font-medium text-[#2f4f36]">{item.label}</p>
						)}
					</article>
				))}
			</div>

			<div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-3 shadow-sm md:grid-cols-2">
				{heroBanners.map((banner, index) => (
					<article key={banner.image} className="relative min-h-[184px] overflow-hidden rounded-xl">
						<a href={banner.href} className="block h-full w-full">
							<div className={`w-full h-auto overflow-hidden relative ${index % 2 === 0 ? 'lg:pr-[8px]' : 'lg:pl-[8px]'}`}>
								<img
									src={banner.image}
									alt={banner.alt}
									loading="eager"
									fetchPriority="high"
									decoding="async"
									className="min-h-[176px] w-full rounded-[12px] object-contain transition-opacity duration-300 opacity-100"
								/>
							</div>
						</a>
					</article>
				))}
			</div>

			<div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
				<div className="flex flex-wrap gap-3 text-sm text-slate-600">
					{trustTags.map((tag) => (
						<span key={tag} className="rounded-full bg-[#effaf0] px-3 py-1.5">
							{tag}
						</span>
					))}
				</div>
			</div>

			{isLoadingProducts && (
				<section className="rounded-2xl bg-white p-4 shadow-sm">
					<p className="py-2 text-sm text-slate-600">Dang tai san pham...</p>
				</section>
			)}

			{!isLoadingProducts && productError && (
				<section className="rounded-2xl bg-white p-4 shadow-sm">
					<p className="py-2 text-sm font-medium text-red-500">{productError}</p>
				</section>
			)}

			{!isLoadingProducts && !productError && sections.length === 0 && (
				<section className="rounded-2xl bg-white p-4 shadow-sm">
					<p className="py-2 text-sm text-slate-600">Chua co san pham theo danh muc.</p>
				</section>
			)}

			{!isLoadingProducts && !productError && sections.length > 0 && (
				<div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_150px]">
					<div className="space-y-4">
						{sections.map((section) => (
							<section
								id={`category-section-${section.category._id}`}
								key={section.category._id}
								className="overflow-hidden rounded-2xl bg-white shadow-sm"
							>
							<div className="flex items-center justify-between bg-[#35b548] px-5 py-4 text-white">
								<h3 className="text-xl font-extrabold uppercase tracking-wide">{section.category.categoryName}</h3>
								<button
									type="button"
									onClick={() => openCategoryPage(section.category._id)}
									className="font-semibold text-white/90 hover:text-white"
								>
									Xem tat ca
								</button>
							</div>

							<div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
								{section.products.map((item) => {
									const meta = buildCardMeta(item)

									return (
										<ProductCard
											key={item.id}
											productCode={item.medicineCode}
											productId={item.id}
											name={item.productName}
											imageUrl={meta.imageUrl}
											price={item.price}
											originalPrice={meta.originalPrice}
											sale={meta.discountLabel}
											soldCount={meta.soldCount}
											totalCount={meta.totalCount}
											onViewDetail={onOpenProductDetail}
										/>
									)
								})}
							</div>
							</section>
						))}
					</div>

					<aside className="hidden self-start xl:sticky xl:top-24 xl:block">
						<div className="rounded-xl border border-[#cce9cf] bg-white p-2.5 shadow-sm">
							<p className="text-xs font-bold text-[#2f6d39]">Danh muc nhanh</p>
							<div className="mt-2 flex flex-col gap-1.5">
								{sections.slice(0, 11).map((section) => (
									<button
										key={`menu-${section.category._id}`}
										type="button"
										onClick={() => scrollToCategorySection(section.category._id)}
										className="rounded-md border border-[#bfe8c3] bg-[#f9fff9] px-2 py-1.5 text-left text-[11px] font-semibold text-[#2f6d39] transition hover:bg-[#ecffef]"
									>
										<span className="line-clamp-2">{section.category.categoryName}</span>
									</button>
								))}
							</div>
						</div>
					</aside>
				</div>
			)}

			<section className="rounded-2xl bg-white p-4 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-xl font-bold text-[#2aa443]">Ban Tin Suc Khoe</h3>
					<button
						type="button"
						onClick={() => openHealthNewsPage('1')}
						className="text-sm font-medium text-[#2aa443] hover:text-[#228e39]"
					>
						Xem tat ca
					</button>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{healthNews.map((item) => (
						<article
							key={item.id}
							role="button"
							tabIndex={0}
							onClick={() => openHealthNewsPage(item.id)}
							onKeyDown={(event) => {
								if (event.key === 'Enter' || event.key === ' ') {
									event.preventDefault()
									openHealthNewsPage(item.id)
								}
							}}
							className="cursor-pointer rounded-lg border border-slate-200 p-2 transition hover:border-[#7fcf8a] hover:shadow-sm"
						>
							<div className="overflow-hidden rounded-md">
								<img
									src={item.image}
									alt={item.title}
									loading="lazy"
									className="h-[150px] w-full object-cover"
								/>
							</div>
							<h4 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-5 text-slate-800">
								{item.title}
							</h4>
							<p className="mt-1 text-xs text-slate-500">{item.date}</p>
						</article>
					))}
				</div>
			</section>
		</PharmacyLayout>
	)
}

export default HomePage
