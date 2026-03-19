import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo1({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="11 tac dung cua dau tay voi suc khoe ban nen biet"
			updatedAt="17/03/2026"
			views={14451}
			author="Le Nguyen Phuong Uyen"
			heroImage="https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg"
			summary="Dau tay la trai cay it calo, giau chat xo va vitamin C. Neu dung dung cach, dau tay ho tro tim mach, de tieu hoa va giup da khoe hon."
			sections={[
				{
					heading: 'Dinh duong noi bat',
					paragraphs: [
						'Dau tay chua nhieu nuoc, chat xo va vitamin C, phu hop cho nguoi can kiem soat can nang.',
						'Trai cay nay cung bo sung kali va mot luong chat chong oxy hoa tu nhien.',
					],
					image: 'https://cdn.tgdd.vn/News/1564370/11-tac-dung-cua-dau-tay-voi-suc-khoe-ban-nen-biet1-800x450.jpg',
					imageCaption: 'Dau tay la trai cay pho bien, de ket hop trong che do an hang ngay.',
				},
				{
					heading: 'Loi ich chinh cho suc khoe',
					paragraphs: ['Dung dau tay deu dan co the ho tro mien dich, tim mach va he tieu hoa.'],
					bullets: [
						'Ho tro giam viem nhe nho polyphenol',
						'Giup on dinh duong huyet sau bua an',
						'Gop phan bao ve da nho chat chong oxy hoa',
					],
					image: 'https://cdn.tgdd.vn/News/1564370/11-tac-dung-cua-dau-tay-voi-suc-khoe-ban-nen-biet5-800x450.jpg',
					imageCaption: 'Dung dung luong va deu dan se giup tang hieu qua cho suc khoe.',
				},
				{
					heading: 'Cach dung an toan',
					paragraphs: [
						'Rua sach truoc khi an, uu tien nguon goc ro rang, khong nen an qua nhieu trong mot lan.',
						'Nguoi co co dia di ung trai cay can bat dau voi luong nho de theo doi phan ung.',
					],
					image: 'https://cdn.tgdd.vn/News/1564370/11-tac-dung-cua-dau-tay-voi-suc-khoe-ban-nen-biet20-800x450.jpg',
					imageCaption: 'Rua sach va bao quan dung cach truoc khi su dung.',
				},
			]}
			related={[
				{ id: '2', title: 'Top 23 kem chong nang pho rong duoc khuyen dung', date: '14/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg' },
				{ id: '3', title: 'Nen mua duong an kieng loai nao cho che do lanh manh', date: '16/03/2026', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80' },
				{ id: '4', title: 'La lot co tac dung gi va cach dung dung lieu', date: '15/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1516538/la-lot-la-cay-than-thao-mem-moc-thanh-tung-bui.jpg' },
				{ id: '6', title: 'Top 21 sua rua mat cho da dau mun', date: '12/03/2026', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo1
