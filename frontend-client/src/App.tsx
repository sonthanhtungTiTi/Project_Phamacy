import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'

const getProductIdFromPath = () => {
  const match = window.location.pathname.match(/^\/product\/([^/]+)$/)
  return match ? decodeURIComponent(match[1]) : ''
}

const getCategoryIdFromPath = () => {
	const match = window.location.pathname.match(/^\/category\/([^/]+)$/)
	return match ? decodeURIComponent(match[1]) : ''
}

function App() {
	const [activeProductId, setActiveProductId] = useState(getProductIdFromPath())
	const [activeCategoryId, setActiveCategoryId] = useState(getCategoryIdFromPath())

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const onPopState = () => {
		setActiveProductId(getProductIdFromPath())
		setActiveCategoryId(getCategoryIdFromPath())
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

	useEffect(() => {
		scrollToTop()
	}, [activeProductId, activeCategoryId])

  const openProductDetail = (productId: string) => {
    if (!productId) {
      return
    }

    const nextPath = `/product/${encodeURIComponent(productId)}`
    window.history.pushState({}, '', nextPath)
    setActiveProductId(productId)
    setActiveCategoryId('')
  }

  const openCategory = (categoryId: string) => {
    if (!categoryId) {
      return
    }

    const nextPath = `/category/${encodeURIComponent(categoryId)}`
    window.history.pushState({}, '', nextPath)
    setActiveCategoryId(categoryId)
    setActiveProductId('')
  }

  const backHome = () => {
    window.history.pushState({}, '', '/')
    setActiveProductId('')
    setActiveCategoryId('')
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

	return <HomePage onOpenProductDetail={openProductDetail} onOpenCategory={openCategory} />
}

export default App
