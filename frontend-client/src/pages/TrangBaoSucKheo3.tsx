import HealthNewsPage from '../components/ui/health-news-page'

interface TrangBaoSucKheoProps {
	onBackHome?: () => void
}

function TrangBaoSucKheo3({ onBackHome }: TrangBaoSucKheoProps) {
	return (
		<HealthNewsPage
			title="Nen mua duong an kieng loai nao cho che do an lanh manh?"
			updatedAt="16/03/2026"
			views={31079}
			author="Huynh Dam Kim Ngan"
			heroImage="https://images.unsplash.com/photo-1515007917921-c4db1d7b4bf7?auto=format&fit=crop&w=1400&q=80"
			summary="Duong an kieng giup giam luong duong nap vao nhung can dung dung cach. Quan trong nhat la chon loai phu hop va kiem soat tong luong su dung moi ngay."
			sections={[
				{
					heading: 'Duong an kieng la gi',
					paragraphs: [
						'Day la nhom chat tao ngot co it hoac khong co calo, duoc dung thay duong thong thuong trong do uong va nau an.',
					],
					image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Duong an kieng co nhieu nhom, can chon theo nhu cau su dung.',
				},
				{
					heading: 'Nhom pho bien tren thi truong',
					paragraphs: ['Moi nhom co uu diem rieng, can uu tien san pham co thong tin ro rang va huong dan cu the.'],
					bullets: [
						'Chat tao ngot tu nhien nhu stevia, monk fruit',
						'Polyol nhu erythritol, xylitol',
						'Chat tao ngot tong hop nhu sucralose, aspartame',
					],
					image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Moi nhom duong co uu diem rieng va cach dung khac nhau.',
				},
				{
					heading: 'Luu y khi su dung',
					paragraphs: [
						'Nguoi co benh nen, phu nu mang thai hoac dang cho con bu nen hoi y kien bac si truoc khi dung lau dai.',
						'Trang thai day bung, kho tieu co the xuat hien neu dung qua nhieu mot so loai polyol.',
					],
					image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
					imageCaption: 'Can su dung dieu do, khong nen lam dung chat tao ngot.',
				},
			]}
			related={[
				{ id: '1', title: 'Dau tay va cac loi ich cho suc khoe', date: '17/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1564370/dau-tay-co-tac-dung-gi639094412853630624.jpg' },
				{ id: '2', title: 'Top kem chong nang pho rong duoc khuyen dung', date: '14/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/ankhang/News/Thumb/1534796/top-kem-chong-nang-pho-rong639092741642479141.jpg' },
				{ id: '4', title: 'La lot co tac dung gi va cach dung', date: '15/03/2026', image: 'https://cdnv2.tgdd.vn/mwg-static/common/News/1516538/la-lot-la-cay-than-thao-mem-moc-thanh-tung-bui.jpg' },
				{ id: '6', title: 'Sua rua mat cho da dau mun duoc khuyen dung', date: '12/03/2026', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80' },
			]}
			onBackHome={onBackHome}
		/>
	)
}

export default TrangBaoSucKheo3
