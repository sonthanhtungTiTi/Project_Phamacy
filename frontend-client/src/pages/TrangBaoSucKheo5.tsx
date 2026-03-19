import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo5({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="Cam nang kem chong nang pho rong cho da dau va da nhay cam"
			updatedAt="13/03/2026"
			views={15220}
			author="To bien tap suc khoe T&Q"
			heroImage="https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg"
			summary="Day la ban rut gon de ban chon nhanh kem chong nang theo loai da, thoi gian hoat dong va dieu kien thoi tiet. Noi dung gon, de ap dung moi ngay."
			sections={[
				{
					heading: 'Chon theo loai da',
					paragraphs: ['Moi loai da can mot ket cau khac nhau de tranh bi, kich ung hoac bong dau qua muc.'],
					bullets: [
						'Da dau: gel hoac fluid kho nhanh',
						'Da kho: kem co bo sung duong am',
						'Da nhay cam: uu tien bo loc vat ly, it huong lieu',
					],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-1-800x450-1.jpg',
					imageCaption: 'Ket cau phu hop giup giam kho chiu khi dung moi ngay.',
				},
				{
					heading: 'Lich boi lai de nho',
					paragraphs: [
						'Neu o ngoai troi lien tuc, nen boi lai sau moi 2 gio.',
						'Neu lam viec van phong, van nen boi lai vao buoi trua, dac biet khi ngoi gan cua kinh.',
					],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-10-800x450.jpg',
					imageCaption: 'Boi lai dung thoi diem la yeu to quyet dinh hieu qua bao ve.',
				},
				{
					heading: 'Sai lam thuong gap',
					paragraphs: ['Nhieu nguoi bo qua co va tai, hoac chi boi mot lop qua mong nen hieu qua giam ro ret.'],
					image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-16-800x450.jpg',
					imageCaption: 'Khong bo qua cac vung de tiep xuc nang va boi du luong can thiet.',
				},
			]}
			related={[
				{ id: '2', title: 'Top 23 kem chong nang pho rong duoc khuyen dung', date: '14/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg' },
				{ id: '6', title: 'Top 21 sua rua mat cho da dau mun', date: '12/03/2026', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80' },
				{ id: '1', title: '11 tac dung cua dau tay voi suc khoe', date: '17/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg' },
				{ id: '3', title: 'Duong an kieng va cach dung dung', date: '16/03/2026', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo5
