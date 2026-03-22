import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import ConsultPharmacy from './pages/ConsultPharmacy'
import HealthNewsDetail from './pages/HealthNewsDetail'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import MomoResultPage from './pages/MomoResultPage'
import ProfilePage from './pages/ProfilePage.tsx'

const getProductIdFromPath = () => {
  const match = window.location.pathname.match(/^\/product\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

const getCategoryIdFromPath = () => {
	const match = window.location.pathname.match(/^\/category\/([^/]+)$/)
	return match ? decodeURIComponent(match[1]) : ''
}

const isConsultPagePath = () => /^\/mua-thuoc-tu-van\/?$/.test(window.location.pathname)
const isCartPagePath = () => /^\/gio-hang\/?$/.test(window.location.pathname)
const isCheckoutPagePath = () => /^\/thanh-toan\/?$/.test(window.location.pathname)
const isMomoResultPagePath = () => /^\/checkout\/momo-return\/?$/.test(window.location.pathname)
const isProfilePagePath = () => /^\/profile\/?$/.test(window.location.pathname)

const getHealthNewsIdFromPath = () => {
  const match = window.location.pathname.match(/^\/ban-tin-suc-khoe\/(1|2|3|4|5|6)$/)
  return match ? match[1] : ''
}

function App() {
	const [activeProductId, setActiveProductId] = useState(getProductIdFromPath())
	const [activeCategoryId, setActiveCategoryId] = useState(getCategoryIdFromPath())
  const [isConsultPage, setIsConsultPage] = useState(isConsultPagePath())
  const [isCartPage, setIsCartPage] = useState(isCartPagePath())
  const [isCheckoutPage, setIsCheckoutPage] = useState(isCheckoutPagePath())
  const [isMomoResultPage, setIsMomoResultPage] = useState(isMomoResultPagePath())
  const [isProfilePage, setIsProfilePage] = useState(isProfilePagePath())
  const [activeHealthNewsId, setActiveHealthNewsId] = useState(getHealthNewsIdFromPath())

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPopState = () => {
		setActiveProductId(getProductIdFromPath())
		setActiveCategoryId(getCategoryIdFromPath())
    setIsConsultPage(isConsultPagePath())
    setIsCartPage(isCartPagePath())
    setIsCheckoutPage(isCheckoutPagePath())
    setIsMomoResultPage(isMomoResultPagePath())
    setIsProfilePage(isProfilePagePath())
    setActiveHealthNewsId(getHealthNewsIdFromPath())
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

	useEffect(() => {
		scrollToTop()
	}, [activeProductId, activeCategoryId])

  useEffect(() => {
    scrollToTop()
  }, [activeHealthNewsId])

  const openProductDetail = (productId: string) => {
    if (!productId) {
      return
    }

    const nextPath = `/product/${encodeURIComponent(productId)}`
    window.history.pushState({}, '', nextPath)
    setActiveProductId(productId)
    setActiveCategoryId('')
    setIsConsultPage(false)
    setIsCartPage(false)
    setIsCheckoutPage(false)
    setIsProfilePage(false)
    setActiveHealthNewsId('')
  }

  const openCategory = (categoryId: string) => {
    if (!categoryId) {
      return
    }

    const nextPath = `/category/${encodeURIComponent(categoryId)}`
    window.history.pushState({}, '', nextPath)
    setActiveCategoryId(categoryId)
    setActiveProductId('')
    setIsConsultPage(false)
    setIsCartPage(false)
    setIsCheckoutPage(false)
    setIsProfilePage(false)
    setActiveHealthNewsId('')
  }

  const openConsultPage = () => {
    window.history.pushState({}, '', '/mua-thuoc-tu-van')
    setActiveProductId('')
    setActiveCategoryId('')
    setIsConsultPage(true)
    setIsCartPage(false)
    setIsCheckoutPage(false)
    setIsProfilePage(false)
    setActiveHealthNewsId('')
  }

  const openHealthNewsPage = (newsId: string) => {
    if (!newsId) {
      return
    }

    window.history.pushState({}, '', `/ban-tin-suc-khoe/${encodeURIComponent(newsId)}`)
    setActiveProductId('')
    setActiveCategoryId('')
    setIsConsultPage(false)
    setIsCartPage(false)
    setIsCheckoutPage(false)
    setIsProfilePage(false)
    setActiveHealthNewsId(newsId)
  }

  const backHome = () => {
    window.history.pushState({}, '', '/')
    setActiveProductId('')
    setActiveCategoryId('')
    setIsConsultPage(false)
    setIsCartPage(false)
    setIsCheckoutPage(false)
    setIsProfilePage(false)
    setActiveHealthNewsId('')
  }

  if (activeProductId) {
    return <ProductDetail productId={activeProductId} onBackHome={backHome} />
  }

  if (activeCategoryId) {
    return (
      <Category
        categoryId={activeCategoryId}
        onBackHome={backHome}
        onOpenProductDetail={openProductDetail}
      />
    )
  }

  if (isConsultPage) {
    return <ConsultPharmacy onBackHome={backHome} />
  }

  if (isCartPage) {
    return <CartPage onBackHome={backHome} />
  }

  if (isCheckoutPage) {
    return (
      <CheckoutPage
        onBackToCart={() => {
          window.history.pushState({}, '', '/gio-hang')
          window.dispatchEvent(new PopStateEvent('popstate'))
        }}
        onBackHome={backHome}
      />
    )
  }

  if (isMomoResultPage) {
    return <MomoResultPage />
  }

  if (isProfilePage) {
    return <ProfilePage onBackHome={backHome} />
  }

  if (activeHealthNewsId) {
    return <HealthNewsDetail newsId={activeHealthNewsId} onBackHome={backHome} />
  }

  return (
    <HomePage
      onOpenProductDetail={openProductDetail}
      onOpenCategory={openCategory}
      onOpenConsultPage={openConsultPage}
      onOpenHealthNews={openHealthNewsPage}
    />
  )
}

export default App
