import { useEffect, useState } from 'react'
import PharmacyLayout, { type CategoryItem } from '../components/layout/layout'
import ProductCard from '../components/ui/product-card'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { getCategories } from '../services/category.service'
import { getProducts, type ProductItem } from '../services/product.service'

const quickActions = [
	'Mua thuoc, tu van',
	'Tu thuoc gia dinh',
	'Tra cuu chinh hang',
	'Don hang cua toi',
	'Dat lich kham benh',
	'Kiem tra suc khoe',
	'Doi tac nha thuoc',
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
}

interface CategorySection {
	category: CategoryItem
	products: ProductItem[]
}

function HomePage({ onOpenProductDetail, onOpenCategory }: HomePageProps) {
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
							limit: 5,
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
						key={item}
						className="rounded-xl border border-slate-100 bg-[#f7faf7] p-3 text-center"
					>
						<div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#89db73] to-[#2cb34d] text-white">
							+
						</div>
						<p className="text-sm font-medium text-slate-700">{item}</p>
					</article>
				))}
			</div>

			<div className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-3 shadow-sm md:grid-cols-2">
				<article className="relative overflow-hidden rounded-xl bg-[radial-gradient(circle_at_14%_20%,#70f08a_0,#09b640_52%,#058335_100%)] p-6 text-white">
					<p className="text-sm font-semibold text-white/85">Mung nam moi</p>
					<h3 className="mt-2 max-w-[280px] text-3xl font-black leading-[1.05] md:text-4xl">
						MA DAO AN KHANG
					</h3>
					<p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm">
						Mua nhieu giam nhieu
					</p>
					<div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-sm" />
				</article>

				<article className="relative overflow-hidden rounded-xl bg-[linear-gradient(120deg,#ac1575,#d53d88,#f282ad)] p-6 text-white">
					<p className="text-sm font-semibold text-white/90">Nuoc uong collagen</p>
					<h3 className="mt-2 text-4xl font-black leading-none">ALFE 15%</h3>
					<p className="mt-3 max-w-[270px] text-sm text-white/85">
						Bao ve, giu net dep tuoi tre va bo sung collagen de hap thu.
					</p>
				</article>
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
				<>
					{sections.map((section) => (
						<section key={section.category._id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
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

							<div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-5">
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
				</>
			)}
		</PharmacyLayout>
	)
}

export default HomePage
