import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo6({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="Top 21 sua rua mat cho da dau mun duoc bac si da lieu khuyen dung"
			updatedAt="12/03/2026"
			views={71258}
			author="Nguyen Thi Thuy"
			heroImage="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1400&q=80"
			summary="Da dau mun can sua rua mat lam sach du, nhung khong pha vo hang rao bao ve da. Danh sach goi y tap trung vao do diu nhe, kha nang kiem dau va tinh an toan."
			sections={[
				{
					heading: 'Nguyen tac chon sua rua mat',
					paragraphs: [
						'Uu tien san pham co pH can bang, thanh phan lam sach diu nhe va thong tin ro cho da dau mun.',
						'Tranh dung loai tay rua qua manh vi de gay kho, kich thich tiet dau nguoc tro lai.',
					],
					image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Chon sua rua mat diu nhe giup giu can bang va han che kich ung.',
				},
				{
					heading: 'Quy trinh rua mat nhanh',
					paragraphs: ['Rua mat dung cach se giup giam bi tac lo chan long va han che mun viem.'],
					bullets: [
						'Rua 2 lan moi ngay, sang va toi',
						'Massage nhe 20 den 30 giay',
						'Lau kho bang khan mem sach va duong am nhe sau do',
					],
					image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Rua mat dung ky thuat se giup lam sach ma khong lam toan thuong da.',
				},
				{
					heading: 'Khi nao can doi san pham',
					paragraphs: [
						'Neu sau 2 den 4 tuan da van do rat, bong troc hoac mun nang hon, ban nen doi san pham va trao doi voi bac si da lieu.',
					],
					image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Theo doi phan ung cua da de dieu chinh san pham phu hop hon.',
				},
			]}
			related={[
				{ id: '2', title: 'Top 23 kem chong nang pho rong duoc khuyen dung', date: '14/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg' },
				{ id: '5', title: 'Cam nang kem chong nang cho da dau', date: '13/03/2026', image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg' },
				{ id: '1', title: 'Tac dung cua dau tay voi suc khoe', date: '17/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg' },
				{ id: '4', title: 'La lot co tac dung gi va luu y', date: '15/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1516538/la-lot-la-cay-than-thao-mem-moc-thanh-tung-bui.jpg' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo6
