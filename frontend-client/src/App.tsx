import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import MuaThuocTuVan from './pages/MuaThuoc&TuVan'
import TrangBaoSucKheo1 from './pages/TrangBaoSucKheo1'
import TrangBaoSucKheo2 from './pages/TrangBaoSucKheo2'
import TrangBaoSucKheo3 from './pages/TrangBaoSucKheo3'
import TrangBaoSucKheo4 from './pages/TrangBaoSucKheo4'
import TrangBaoSucKheo5 from './pages/TrangBaoSucKheo5'
import TrangBaoSucKheo6 from './pages/TrangBaoSucKheo6'

const getProductIdFromPath = () => {
  const match = window.location.pathname.match(/^\/product\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

const getCategoryIdFromPath = () => {
	const match = window.location.pathname.match(/^\/category\/([^/]+)$/)
	return match ? decodeURIComponent(match[1]) : ''
}

const isConsultPagePath = () => /^\/mua-thuoc-tu-van\/?$/.test(window.location.pathname)

const getHealthNewsIdFromPath = () => {
  const match = window.location.pathname.match(/^\/ban-tin-suc-khoe\/(1|2|3|4|5|6)$/)
  return match ? match[1] : ''
}

function App() {
	const [activeProductId, setActiveProductId] = useState(getProductIdFromPath())
	const [activeCategoryId, setActiveCategoryId] = useState(getCategoryIdFromPath())
  const [isConsultPage, setIsConsultPage] = useState(isConsultPagePath())
  const [activeHealthNewsId, setActiveHealthNewsId] = useState(getHealthNewsIdFromPath())

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPopState = () => {
		setActiveProductId(getProductIdFromPath())
		setActiveCategoryId(getCategoryIdFromPath())
    setIsConsultPage(isConsultPagePath())
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
    setActiveHealthNewsId('')
  }

  const openConsultPage = () => {
    window.history.pushState({}, '', '/mua-thuoc-tu-van')
    setActiveProductId('')
    setActiveCategoryId('')
    setIsConsultPage(true)
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
    setActiveHealthNewsId(newsId)
  }

  const backHome = () => {
    window.history.pushState({}, '', '/')
    setActiveProductId('')
    setActiveCategoryId('')
    setIsConsultPage(false)
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
    return <MuaThuocTuVan onBackHome={backHome} />
  }

  if (activeHealthNewsId === '1') {
    return <TrangBaoSucKheo1 onBackHome={backHome} />
  }

  if (activeHealthNewsId === '2') {
    return <TrangBaoSucKheo2 onBackHome={backHome} />
  }

  if (activeHealthNewsId === '3') {
    return <TrangBaoSucKheo3 onBackHome={backHome} />
  }

  if (activeHealthNewsId === '4') {
    return <TrangBaoSucKheo4 onBackHome={backHome} />
  }

  if (activeHealthNewsId === '5') {
    return <TrangBaoSucKheo5 onBackHome={backHome} />
  }

  if (activeHealthNewsId === '6') {
    return <TrangBaoSucKheo6 onBackHome={backHome} />
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
