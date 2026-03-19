import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo2({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="Top 23 kem chong nang pho rong cac bac si da lieu khuyen dung"
			updatedAt="14/03/2026"
			views={20815}
			author="Nguyen Thi Ngoc Anh"
			heroImage="https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg"
			summary="Kem chong nang pho rong giup bao ve da khoi UVA va UVB. Bai viet tong hop tieu chi chon san pham, cach boi dung va sai lam thuong gap."
			sections={[
				{
					heading: 'Tieu chi de chon kem chong nang',
					paragraphs: ['Nen uu tien san pham co SPF tu 30 tro len, PA+++ hoac cao hon va phu hop loai da.'],
					bullets: [
						'Da dau: uu tien ket cau mong, kho nhanh, khong gay bi',
						'Da kho: uu tien kem co duong am',
						'Da nhay cam: uu tien bo loc vat ly va khong huong lieu manh',
					],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-1-800x450-1.jpg',
					imageCaption: 'Chon san pham theo loai da de tang do tuong thich.',
				},
				{
					heading: 'Cach boi de dat hieu qua',
					paragraphs: [
						'Boi truoc khi ra ngoai khoang 15 den 20 phut.',
						'Boi lai moi 2 gio, dac biet sau khi do mo hoi nhieu hoac rua mat.',
					],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg',
					imageCaption: 'Boi lai dung chu ky giup lop bao ve on dinh hon.',
				},
				{
					heading: 'Luu y khi dung hang ngay',
					paragraphs: [
						'Khong bo qua vung co, tai va mu ban tay.',
						'Ket hop non, kinh va che nang de giam tai tia UV vao da.',
					],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-10-800x450.jpg',
					imageCaption: 'Can ket hop kem chong nang voi cac bien phap che nang co hoc.',
				},
			]}
			related={[
				{ id: '1', title: '11 tac dung cua dau tay voi suc khoe', date: '17/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg' },
				{ id: '5', title: 'Cam nang kem chong nang cho da dau va da nhay cam', date: '13/03/2026', image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg' },
				{ id: '6', title: 'Top 21 sua rua mat cho da dau mun', date: '12/03/2026', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80' },
				{ id: '3', title: 'Duong an kieng va cach dung an toan', date: '16/03/2026', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo2
