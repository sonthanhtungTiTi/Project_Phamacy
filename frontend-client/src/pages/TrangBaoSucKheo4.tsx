import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo4({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="La lot co tac dung gi? Cach dung, lieu dung, bai thuoc va tac dung phu"
			updatedAt="15/03/2026"
			views={98996}
			author="Ly Thi Thu Ha"
			heroImage="https://cdnv2.tgdd.vn/mwg-static/common/News/1516538/la-lot-la-cay-than-thao-mem-moc-thanh-tung-bui.jpg"
			summary="La lot la thuc pham quen thuoc trong bua an Viet. Ngoai vai tro gia vi, la lot con duoc dung trong mot so bai thuoc dan gian de ho tro giam dau nhe."
			sections={[
				{
					heading: 'Cong dung thuong gap',
					paragraphs: [
						'La lot co tinh am, thuong duoc dung de ho tro giam kho chiu khi lanh bung hoac dau moi nhe.',
						'Trong dan gian, la lot hay duoc dung ket hop de ngam chan, xoa boi hoac nau canh.',
					],
					image: 'https://cdn.tgdd.vn/Files/2021/09/17/1385342/la-lot-co-tac-dung-gi-cach-dung-lieu-dung-va-luu-y-khi-202112241535175510.jpg',
					imageCaption: 'La lot duoc dung linh hoat trong bua an va mot so meo cham soc dan gian.',
				},
				{
					heading: 'Cach dung don gian',
					paragraphs: ['Ban co the dung la lot trong bua an hoac ngam chan buoi toi de tao cam giac de chiu.'],
					bullets: [
						'Khau phan thong thuong trong ngay nen o muc vua phai',
						'Khong nen lam dung bai thuoc dan gian thay cho dieu tri y te',
						'Neu trieu chung keo dai, nen di kham som',
					],
					image: 'https://cdn.tgdd.vn/Files/2021/09/17/1385342/la-lot-co-tac-dung-gi-cach-dung-lieu-dung-va-luu-y-khi-202112241536468367.jpg',
					imageCaption: 'Nau an dung cach giup toi uu huong vi va de tieu hon.',
				},
				{
					heading: 'Ai can than trong',
					paragraphs: [
						'Nguoi de nong trong, kich ung da day hoac co benh ly man tinh nen tham khao nhan vien y te truoc khi dung thuong xuyen.',
					],
					image: 'https://cdn.tgdd.vn/Files/2021/09/17/1385342/la-lot-co-tac-dung-gi-cach-dung-lieu-dung-va-luu-y-khi-202112241537089077.jpg',
					imageCaption: 'Can than trong neu co benh nen hoac co dia nhay cam voi thao moc.',
				},
			]}
			related={[
				{ id: '1', title: 'Dau tay va loi ich cho mien dich', date: '17/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg' },
				{ id: '3', title: 'Duong an kieng cho che do lanh manh', date: '16/03/2026', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80' },
				{ id: '5', title: 'Cam nang kem chong nang dang rut gon', date: '13/03/2026', image: 'https://cdn.tgdd.vn/News/1534796/top-23-kem-chong-nang-pho-rong-tot-nhat-cac-bac-3-800x450.jpg' },
				{ id: '6', title: 'Top sua rua mat cho da dau mun', date: '12/03/2026', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo4
