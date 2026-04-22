const mongoose = require('mongoose')

const ChatConversation = require('../../models/chatConversation.model')
const ChatMessage = require('../../models/chatMessage.model')
const Product = require('../../models/product.model')
const Order = require('../../models/order.model')
const User = require('../../models/user.model')
const { INTENTS, classifyIntent, generateReplyFromData, generatePhase2Reply } = require('../ai/ollama.service')

class ChatServiceError extends Error {
	constructor(message, statusCode = 400) {
		super(message)
		this.statusCode = statusCode
	}
}

const SUPPORT_ROLES = new Set(['admin', 'manager', 'pharmacist', 'sales_staff'])

const ensureObjectId = (value, fieldName) => {
	if (!mongoose.Types.ObjectId.isValid(value)) {
		throw new ChatServiceError(`${fieldName} is invalid`, 400)
	}
}

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const toPlainUser = (value) => {
	if (!value || typeof value !== 'object') {
		return null
	}

	const userId = value._id || value.id
	if (!userId) {
		return null
	}

	return {
		id: String(userId),
		fullName: value.fullName || '',
		email: value.email || '',
		phone: value.phone || '',
		role: value.role || '',
	}
}

const serializeConversation = (doc) => ({
	id: String(doc._id),
	sessionId: doc.sessionId,
	status: doc.status,
	clientId: typeof doc.clientId === 'object' ? String(doc.clientId?._id || '') : String(doc.clientId || ''),
	client: toPlainUser(doc.clientId),
	assignedStaffId: typeof doc.assignedStaffId === 'object' ? String(doc.assignedStaffId?._id || '') : doc.assignedStaffId ? String(doc.assignedStaffId) : null,
	assignedStaff: toPlainUser(doc.assignedStaffId),
	lastIntent: doc.lastIntent || '',
	lastAction: doc.lastAction || '',
	lastMessageAt: doc.lastMessageAt,
	unreadForClient: Number(doc.unreadForClient || 0),
	unreadForAdmin: Number(doc.unreadForAdmin || 0),
	metadata: doc.metadata || {},
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
})

const serializeMessage = (doc) => ({
	id: String(doc._id),
	conversationId: String(doc.conversationId),
	senderType: doc.senderType,
	senderId: doc.senderId ? String(doc.senderId) : null,
	senderName: doc.senderName || '',
	content: doc.content,
	intent: doc.intent || '',
	action: doc.action || '',
	meta: doc.meta || {},
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
})

const createTransientMessage = ({ conversationId, senderType, senderId = null, senderName = '', content, intent = '', action = '', meta = {} }) => {
	const now = new Date().toISOString()
	return {
		id: `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		conversationId: String(conversationId),
		senderType,
		senderId: senderId ? String(senderId) : null,
		senderName: String(senderName || '').trim(),
		content: String(content || '').trim(),
		intent,
		action,
		meta,
		createdAt: now,
		updatedAt: now,
	}
}

const createSessionId = (clientId) =>
	`conv_${String(clientId)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const findOrCreateActiveConversation = async (clientId) => {
	ensureObjectId(clientId, 'clientId')

	let conversation = await ChatConversation.findOne({
		clientId,
		status: { $in: ['ai', 'human_pending', 'human'] },
	})
		.sort({ updatedAt: -1 })
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	if (!conversation) {
		conversation = await ChatConversation.create({
			sessionId: createSessionId(clientId),
			clientId,
			status: 'ai',
			lastIntent: INTENTS.GENERAL_FAQ,
			lastAction: INTENTS.GENERAL_FAQ,
		})

		conversation = await ChatConversation.findById(conversation._id)
			.populate('clientId', 'fullName email phone role')
			.populate('assignedStaffId', 'fullName email phone role')
	}

	return conversation
}

const appendMessage = async ({ conversationId, senderType, senderId = null, senderName = '', content, intent = '', action = '', meta = {} }) => {
	if (!content || !String(content).trim()) {
		throw new ChatServiceError('Message content is required', 400)
	}

	ensureObjectId(conversationId, 'conversationId')

	const message = await ChatMessage.create({
		conversationId,
		senderType,
		senderId: senderId && mongoose.Types.ObjectId.isValid(senderId) ? senderId : null,
		senderName: String(senderName || '').trim(),
		content: String(content).trim(),
		intent,
		action,
		meta,
	})

	const baseUpdate = {
		$set: {
			lastMessageAt: new Date(),
		},
	}

	if (senderType === 'user') {
		baseUpdate.$set.unreadForClient = 0
		baseUpdate.$inc = { unreadForAdmin: 1 }
	}

	if (senderType === 'admin') {
		baseUpdate.$set.unreadForAdmin = 0
		baseUpdate.$inc = { unreadForClient: 1 }
	}

	if (senderType === 'bot' || senderType === 'system') {
		baseUpdate.$inc = { unreadForClient: 1 }
	}

	await ChatConversation.findByIdAndUpdate(conversationId, baseUpdate)

	return message
}

const getConversationMessages = async (conversationId, limit = 40) => {
	ensureObjectId(conversationId, 'conversationId')
	const safeLimit = Math.min(200, Math.max(1, Number(limit) || 40))

	const docs = await ChatMessage.find({ conversationId })
		.sort({ createdAt: -1 })
		.limit(safeLimit)
		.lean()

	return docs.reverse().map(serializeMessage)
}

const touchConversation = async (conversationId, payload = {}) => {
	ensureObjectId(conversationId, 'conversationId')

	const updatePayload = {
		...payload,
		lastMessageAt: new Date(),
	}

	await ChatConversation.findByIdAndUpdate(conversationId, {
		$set: updatePayload,
	})

	return ChatConversation.findById(conversationId)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')
}

const getClientConversationSnapshot = async (clientId, { limit = 40 } = {}) => {
	const conversation = await findOrCreateActiveConversation(clientId)
	const messages = await getConversationMessages(conversation._id, limit)

	await ChatConversation.findByIdAndUpdate(conversation._id, {
		$set: { unreadForClient: 0 },
	})

	return {
		conversation: serializeConversation(conversation),
		messages,
	}
}

const getClientMessages = async (clientId, conversationId, { limit = 40 } = {}) => {
	ensureObjectId(clientId, 'clientId')
	ensureObjectId(conversationId, 'conversationId')

	const conversation = await ChatConversation.findOne({
		_id: conversationId,
		clientId,
	})
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	if (!conversation) {
		throw new ChatServiceError('Conversation not found', 404)
	}

	const messages = await getConversationMessages(conversationId, limit)
	await ChatConversation.findByIdAndUpdate(conversationId, {
		$set: { unreadForClient: 0 },
	})

	return {
		conversation: serializeConversation(conversation),
		messages,
	}
}

const requestHumanFromClient = async (clientId, conversationId = null, reason = '') => {
	ensureObjectId(clientId, 'clientId')

	let conversation = null
	if (conversationId) {
		ensureObjectId(conversationId, 'conversationId')
		conversation = await ChatConversation.findOne({ _id: conversationId, clientId })
	}

	if (!conversation) {
		conversation = await findOrCreateActiveConversation(clientId)
	}

	let switchedToPending = false

	if (conversation.status !== 'human' && conversation.status !== 'human_pending') {
		conversation = await touchConversation(conversation._id, {
			status: 'human_pending',
			assignedStaffId: null,
			lastAction: INTENTS.CALL_HUMAN,
			metadata: {
				...(conversation.metadata || {}),
				lastHumanRequestReason: String(reason || '').trim(),
			},
		})
		switchedToPending = true
	}

	let systemMessage = null
	if (conversation.status === 'human_pending' && switchedToPending) {
		systemMessage = await appendMessage({
			conversationId: conversation._id,
			senderType: 'system',
			content: 'Yeu cau ho tro voi nhan vien da duoc ghi nhan. Vui long doi trong giay lat.',
			action: INTENTS.CALL_HUMAN,
			meta: {
				reason: String(reason || '').trim(),
			},
		})
	}

	conversation = await ChatConversation.findById(conversation._id)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	return {
		conversation: serializeConversation(conversation),
		systemMessage: systemMessage ? serializeMessage(systemMessage) : null,
	}
}

const ensureStaffCanAccessConversation = async (staffId, conversationId) => {
	ensureObjectId(staffId, 'staffId')
	ensureObjectId(conversationId, 'conversationId')

	const staff = await User.findById(staffId).select('_id fullName email phone role').lean()
	if (!staff) {
		throw new ChatServiceError('Staff user not found', 404)
	}

	if (!SUPPORT_ROLES.has(staff.role)) {
		throw new ChatServiceError('Only support staff can access this conversation', 403)
	}

	const conversation = await ChatConversation.findById(conversationId)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	if (!conversation) {
		throw new ChatServiceError('Conversation not found', 404)
	}

	return { staff, conversation }
}

const assignConversationToStaff = async (conversationId, { staffId, staffName = '' }) => {
	const { staff, conversation } = await ensureStaffCanAccessConversation(staffId, conversationId)

	const nextStaffName = String(staffName || staff.fullName || 'Nhan vien').trim()

	const updated = await touchConversation(conversation._id, {
		status: 'human',
		assignedStaffId: staff._id,
		lastAction: INTENTS.CALL_HUMAN,
		unreadForAdmin: 0,
	})

	const systemMessage = await appendMessage({
		conversationId: conversation._id,
		senderType: 'system',
		senderId: staff._id,
		senderName: nextStaffName,
		content: `Nhan vien ${nextStaffName} da tham gia ho tro.`,
		action: INTENTS.CALL_HUMAN,
	})

	const hydrated = await ChatConversation.findById(updated._id)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	return {
		conversation: serializeConversation(hydrated),
		systemMessage: serializeMessage(systemMessage),
	}
}

const closeConversationByStaff = async (conversationId, staffId) => {
	const { conversation } = await ensureStaffCanAccessConversation(staffId, conversationId)

	await touchConversation(conversation._id, {
		status: 'closed',
		lastAction: 'CLOSED_BY_STAFF',
		unreadForAdmin: 0,
	})

	const systemMessage = await appendMessage({
		conversationId: conversation._id,
		senderType: 'system',
		senderId: staffId,
		content: 'Cuoc tro chuyen da duoc ket thuc boi nhan vien.',
		action: 'CLOSED_BY_STAFF',
	})

	const hydrated = await ChatConversation.findById(conversation._id)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	return {
		conversation: serializeConversation(hydrated),
		systemMessage: serializeMessage(systemMessage),
	}
}

const listConversationsForAdmin = async ({ status = 'all', page = 1, limit = 20, keyword = '' } = {}) => {
	const safePage = Math.max(1, Number(page) || 1)
	const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20))
	const skip = (safePage - 1) * safeLimit

	const filter = {}
	if (status && status !== 'all') {
		filter.status = String(status)
	}

	const normalizedKeyword = String(keyword || '').trim()
	if (normalizedKeyword) {
		const regex = new RegExp(escapeRegex(normalizedKeyword), 'i')
		const candidateUsers = await User.find({
			$or: [{ fullName: regex }, { email: regex }, { phone: regex }],
		})
			.select('_id')
			.lean()

		const candidateUserIds = candidateUsers.map((item) => item._id)
		filter.$or = [{ sessionId: regex }, { clientId: { $in: candidateUserIds } }]
	}

	const [items, total] = await Promise.all([
		ChatConversation.find(filter)
			.sort({ lastMessageAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate('clientId', 'fullName email phone role')
			.populate('assignedStaffId', 'fullName email phone role')
			.lean(),
		ChatConversation.countDocuments(filter),
	])

	const ids = items.map((item) => item._id)
	const latestMessages = ids.length
		? await ChatMessage.aggregate([
				{ $match: { conversationId: { $in: ids } } },
				{ $sort: { createdAt: -1 } },
				{
					$group: {
						_id: '$conversationId',
						content: { $first: '$content' },
						senderType: { $first: '$senderType' },
						createdAt: { $first: '$createdAt' },
					},
				},
			])
		: []

	const latestByConversationId = new Map(latestMessages.map((item) => [String(item._id), item]))

	const rows = items.map((item) => {
		const serialized = serializeConversation(item)
		const latest = latestByConversationId.get(String(item._id))
		return {
			...serialized,
			latestMessage: latest
				? {
					content: latest.content,
					senderType: latest.senderType,
					createdAt: latest.createdAt,
				}
				: null,
		}
	})

	return {
		items: rows,
		pagination: {
			page: safePage,
			limit: safeLimit,
			total,
			totalPages: Math.max(1, Math.ceil(total / safeLimit)),
		},
	}
}

const getConversationMessagesForAdmin = async (staffId, conversationId, { limit = 80 } = {}) => {
	const { conversation } = await ensureStaffCanAccessConversation(staffId, conversationId)
	const messages = await getConversationMessages(conversationId, limit)

	await ChatConversation.findByIdAndUpdate(conversationId, {
		$set: { unreadForAdmin: 0 },
	})

	return {
		conversation: serializeConversation(conversation),
		messages,
	}
}

const extractOrderCode = (text) => {
	const match = String(text || '').toUpperCase().match(/ORD[0-9]{8,}/)
	return match ? match[0] : ''
}

const normalizeText = (value) =>
	String(value || '')
		.replace(/[đĐ]/g, (char) => (char === 'Đ' ? 'D' : 'd'))
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()

const PRODUCT_LOOKUP_HINT_REGEX = /\b(tim|tra\s?cuu|san\s?pham|thuoc|gia|hoat\s?chat|con\s?hang)\b/i
const ORDER_LOOKUP_HINT_REGEX = /\b(don\s?hang|ma\s?don|trang\s?thai|van\s?don|giao\s?hang|thanh\s?toan|ord[0-9]{6,})\b/i
const SYMPTOM_QUERY_HINT_REGEX = /\b(bi|dang bi|cam thay|met|khong khoe|trieu chung|dau|ho|sot|ngua|viem|tieu chay|buon non|chong mat)\b/i
const SYMPTOM_KEYWORDS = [
	'dau hong',
	'nghet mui',
	'so mui',
	'kho tho',
	'dau bung',
	'dau dau',
	'dau lung',
	'dau rang',
	'dau co',
	'dau khop',
	'dau vai',
	'dau nguc',
	'mat ngu',
	'met moi',
	'chong mat',
	'buon non',
	'non',
	'tieu chay',
	'tao bon',
	'day bung',
	'khong tieu',
	'ho',
	'sot',
	'sỏt',
	'cam',
	'cum',
	'di ung',
	'ngua',
	'man do',
	'noi me day',
	'viem',
	'viem hong',
	'viem mui',
	'viem xoang',
]

const VIETNAMESE_CHAR_GROUPS = {
	a: 'aAàáạảãâầấậẩẫăằắặẳẵ',
	d: 'dDđĐ',
	e: 'eEèéẹẻẽêềếệểễ',
	i: 'iIìíịỉĩ',
	o: 'oOòóọỏõôồốộổỗơờớợởỡ',
	u: 'uUùúụủũưừứựửữ',
	y: 'yYỳýỵỷỹ',
}

const formatCurrencyVnd = (value) => {
	const amount = Number(value || 0)
	if (!Number.isFinite(amount)) {
		return '0 VND'
	}

	return `${Math.round(amount).toLocaleString('vi-VN')} VND`
}

const normalizeImageField = (value) => {
	if (!value) {
		return ''
	}

	if (Array.isArray(value)) {
		const first = value.find((item) => typeof item === 'string' && item.trim())
		return first ? String(first).trim() : ''
	}

	if (typeof value === 'string') {
		const trimmed = value.trim()
		if (!trimmed) {
			return ''
		}

		if (trimmed.startsWith('[')) {
			try {
				const parsed = JSON.parse(trimmed)
				return normalizeImageField(parsed)
			} catch {
				// Ignore parse error and continue fallback parsing.
			}
		}

		if (trimmed.includes(',')) {
			const first = trimmed
				.split(',')
				.map((item) => item.trim())
				.find(Boolean)
			return first || ''
		}

		return trimmed
	}

	return ''
}

const extractSymptomKeyword = (text) => {
	const normalized = normalizeText(text)
	if (!normalized) {
		return ''
	}

	const matched = [...SYMPTOM_KEYWORDS]
		.sort((a, b) => b.length - a.length)
		.find((keyword) => normalized.includes(normalizeText(keyword)))
	if (matched) {
		return matched
	}

	const longSymptomMatch = normalized.match(/\b(dau\s?[a-z]{2,}|viem\s?[a-z]{2,}|nghet\s?mui|so\s?mui|kho\s?tho|tieu\s?chay|buon\s?non|chong\s?mat|mat\s?ngu|met\s?moi)\b/)
	if (longSymptomMatch) {
		return String(longSymptomMatch[0]).trim()
	}

	const genericSymptomMatch = normalized.match(/\b(dau\s?[a-z]+|ho|sot|cam|cum|ngua|met\s?moi|chong\s?mat|buon\s?non|tieu\s?chay)\b/)
	return genericSymptomMatch ? String(genericSymptomMatch[0]).trim() : ''
}

const buildVietnameseInsensitivePattern = (text) =>
	String(text || '')
		.split('')
		.map((char) => {
			if (/\s/.test(char)) {
				return '\\s*'
			}

			const normalizedChar = normalizeText(char)
			const group = VIETNAMESE_CHAR_GROUPS[normalizedChar]
			if (group) {
				return `[${escapeRegex(group)}]`
			}

			return escapeRegex(char)
		})
		.join('')

const SYMPTOM_STOPWORDS = new Set(['toi', 'bi', 'dang', 'cam', 'thay', 'khong', 'khoe', 'minh'])

const buildSymptomSearchQueries = ({ content = '', symptomKeyword = '', intentResult = null }) => {
	const rawCandidates = [
		symptomKeyword,
		intentResult?.keyword,
		intentResult?.query,
		intentResult?.message,
		content,
	]

	const queries = []
	const seen = new Set()

	for (const raw of rawCandidates) {
		const normalized = normalizeText(raw)
		if (!normalized) {
			continue
		}

		const compact = normalized.replace(/\s+/g, ' ').trim()
		if (compact.length >= 3 && !seen.has(compact)) {
			seen.add(compact)
			queries.push(compact)
		}

		const tokens = compact
			.split(' ')
			.filter((token) => token.length >= 3 && !SYMPTOM_STOPWORDS.has(token))

		for (const token of tokens) {
			if (!seen.has(token)) {
				seen.add(token)
				queries.push(token)
			}
		}
	}

	return queries.slice(0, 8)
}

const scoreSymptomMatch = (item, queryList) => {
	const usage = normalizeText(item.productName)
	const productName = normalizeText(item.productName || item.medicineName)
	if (!usage && !productName) {
		return 0
	}

	let score = 0

	for (const query of queryList) {
		const normalizedKeyword = normalizeText(query)
		if (!normalizedKeyword) {
			continue
		}

		if (usage.includes(normalizedKeyword)) {
			score += 120
		}
		if (productName.includes(normalizedKeyword)) {
			score += 70
		}

		const tokens = normalizedKeyword
			.split(/\s+/)
			.filter((token) => token.length >= 3 && !SYMPTOM_STOPWORDS.has(token))

		let tokenMatched = 0
		for (const token of tokens) {
			if (usage.includes(token)) {
				score += 30
				tokenMatched += 1
			}
			if (productName.includes(token)) {
				score += 20
				tokenMatched += 1
			}
		}

		if (tokens.length > 1 && tokenMatched >= tokens.length) {
			score += 40
		}
	}

	return score
}

const searchProductsBySymptom = async (queryInput) => {
	const queryList = Array.isArray(queryInput)
		? queryInput.map((item) => normalizeText(item)).filter(Boolean)
		: [normalizeText(queryInput)].filter(Boolean)

	if (queryList.length === 0) {
		return []
	}

	const phraseFilters = []
	for (const query of queryList) {
		const mongoRegex = new RegExp(buildVietnameseInsensitivePattern(query), 'i')
		phraseFilters.push({ productName: { $regex: mongoRegex } })
		phraseFilters.push({ medicineName: { $regex: mongoRegex } })

		const tokens = query.split(/\s+/).filter((token) => token.length >= 3)
		for (const token of tokens) {
			const tokenRegex = new RegExp(buildVietnameseInsensitivePattern(token), 'i')
			phraseFilters.push({ productName: { $regex: tokenRegex } })
			phraseFilters.push({ medicineName: { $regex: tokenRegex } })
		}
	}

	const directMatches = await Product.find({
		isActive: true,
		$or: phraseFilters,
	})
		.select('_id productName medicineName images price usageSummary updatedAt')
		.limit(120)
		.lean()

	let merged = directMatches

	if (merged.length < 4) {
		const fallbackCandidates = await Product.find({
			isActive: true,
			usageSummary: { $exists: true, $ne: '' },
		})
			.select('_id productName medicineName images price usageSummary updatedAt')
			.sort({ updatedAt: -1 })
			.limit(300)
			.lean()

		const knownIds = new Set(merged.map((item) => String(item._id)))
		const filtered = fallbackCandidates.filter((item) => !knownIds.has(String(item._id)))
		merged = merged.concat(filtered)
	}

	return merged
		.map((item) => ({
			id: String(item._id),
			productName: item.productName || item.medicineName || 'San pham',
			imageUrl: normalizeImageField(item.images),
			price: Number(item.price || 0),
			score: scoreSymptomMatch(item, queryList),
			updatedAt: item.updatedAt,
		}))
		.filter((item) => item.score > 0)
		.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score
			}
			return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
		})
		.slice(0, 4)
		.map((item) => ({
			id: item.id,
			productName: item.productName,
			imageUrl: item.imageUrl,
			price: item.price,
		}))
}

const toProductLinkReply = (products) => {
	if (!Array.isArray(products) || products.length === 0) {
		return 'Không tìm thấy sản phẩm phù hợp'
	}

	return products.map((item) => `http://localhost:5173/product/${item.id}`).join('\n')
}

const formatProductSuggestionText = (products) => {
	if (!Array.isArray(products) || products.length === 0) {
		return 'Không tìm thấy sản phẩm phù hợp'
	}

	return 'Mình đã tìm thấy một số sản phẩm phù hợp. Bạn có thể bấm vào thẻ sản phẩm bên dưới để xem chi tiết.'
}

const searchProducts = async (query) => {
	const normalized = String(query || '').trim()
	const filter = { isActive: true }

	if (normalized) {
		const regex = new RegExp(escapeRegex(normalized), 'i')
		filter.$or = [
			{ productName: regex },
			{ medicineName: regex },
			{ medicineCode: regex },
			{ categoryName: regex },
			{ brand: regex },
		]
	}

	const docs = await Product.find(filter)
		.select('medicineCode productName medicineName categoryName price usageSummary brand inventory')
		.sort({ updatedAt: -1 })
		.limit(5)
		.lean()

	return docs.map((item) => ({
		id: String(item._id),
		medicineCode: item.medicineCode || '',
		productName: item.productName || item.medicineName || '',
		categoryName: item.categoryName || '',
		brand: item.brand || '',
		price: Number(item.price || 0),
		usageSummary: item.usageSummary || '',
		totalStock: Array.isArray(item.inventory)
			? item.inventory.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0)
			: 0,
	}))
}

const searchOrdersForUser = async ({ clientId, query }) => {
	const filter = { userId: clientId }
	const orderCode = extractOrderCode(query)

	if (orderCode) {
		filter.orderCode = new RegExp(`^${escapeRegex(orderCode)}$`, 'i')
	}

	const docs = await Order.find(filter)
		.select('orderCode status paymentStatus totalAmount placedAt items')
		.sort({ placedAt: -1 })
		.limit(orderCode ? 1 : 3)
		.lean()

	return docs.map((item) => ({
		id: String(item._id),
		orderCode: item.orderCode,
		status: item.status,
		paymentStatus: item.paymentStatus,
		totalAmount: Number(item.totalAmount || 0),
		placedAt: item.placedAt,
		items: (item.items || []).slice(0, 3).map((line) => ({
			productName: line.productName,
			quantity: line.quantity,
			unitPrice: line.unitPrice,
		})),
	}))
}

const summarizeForPrompt = (payload) => {
	try {
		const text = JSON.stringify(payload)
		return text.length > 4000 ? text.slice(0, 4000) : text
	} catch {
		return 'NO_DATA'
	}
}

const fallbackReplyByAction = (action, { isHumanPending = false } = {}) => {
	if (action === INTENTS.QUERY_PRODUCT || action === INTENTS.FIND_PRODUCT) {
		return 'Mình chua tim thay dung san pham ban can. Ban co the gui ten thuoc, hoat chat hoac yeu cau gap nhan vien de duoc tu van ky hon.'
	}

	if (action === INTENTS.CALL_HUMAN || action === INTENTS.CALL_ADMIN) {
		return 'Mình da ghi nhan yeu cau gap nhan vien. Ban vui long doi trong giay lat.'
	}

	if (isHumanPending) {
		return 'Mình van dang ho tro ban trong luc ket noi nhan vien. Ban co the mo ta them trieu chung hoac ten thuoc can tim de minh tra cuu nhanh.'
	}

	return 'Mình da nhan duoc tin nhan cua ban. Ban co the mo ta cu the hon de minh tu van chinh xac ngay bay gio.'
}

const buildDataDrivenFallbackReply = ({ action, dataPayload = {}, queryText = '' }) => {
	const products = Array.isArray(dataPayload.products) ? dataPayload.products : []
	if (products.length > 0 && (action === INTENTS.FIND_PRODUCT || action === INTENTS.QUERY_PRODUCT)) {
		const lines = products.slice(0, 3).map((item, index) => {
			const stockText = Number(item.totalStock || 0) > 0 ? `con ${Number(item.totalStock || 0)}` : 'tam het hang'
			return `${index + 1}. ${item.productName || 'San pham'} - ${formatCurrencyVnd(item.price)} (${stockText})`
		})

		return ['Mình tim thay mot so san pham phu hop:', ...lines, 'Ban can minh goi y them theo trieu chung khong?'].join('\n')
	}

	const orders = Array.isArray(dataPayload.orders) ? dataPayload.orders : []
	if (orders.length > 0) {
		const lines = orders.slice(0, 3).map((item, index) => {
			const code = item.orderCode || 'N/A'
			const status = item.status || 'unknown'
			const payment = item.paymentStatus || 'unknown'
			const total = formatCurrencyVnd(item.totalAmount)
			return `${index + 1}. ${code} - Trang thai: ${status}, Thanh toan: ${payment}, Tong: ${total}`
		})

		return ['Mình da tim thay thong tin don hang gan day cua ban:', ...lines, 'Ban can kiem tra don nao chi tiet hon khong?'].join('\n')
	}

	if (ORDER_LOOKUP_HINT_REGEX.test(normalizeText(queryText)) || extractOrderCode(queryText)) {
		return 'Mình chua tim thay don hang phu hop voi thong tin ban cung cap. Ban vui long gui ma don dang ORD... de minh kiem tra chinh xac hon.'
	}

	return ''
}

const handleClientMessage = async ({ clientId, clientName = '', conversationId, content }) => {
	ensureObjectId(clientId, 'clientId')

	let conversation = null
	if (conversationId) {
		ensureObjectId(conversationId, 'conversationId')
		conversation = await ChatConversation.findOne({ _id: conversationId, clientId })
			.populate('clientId', 'fullName email phone role')
			.populate('assignedStaffId', 'fullName email phone role')
	}

	if (!conversation) {
		conversation = await findOrCreateActiveConversation(clientId)
	}

	if (conversation.status === 'closed') {
		conversation = await touchConversation(conversation._id, {
			status: 'ai',
			assignedStaffId: null,
			lastAction: 'REOPENED_BY_CLIENT',
		})
	}

	let hydratedConversation = await ChatConversation.findById(conversation._id)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')
	const isHumanPending = hydratedConversation.status === 'human_pending'
	const isHumanConversation = hydratedConversation.status === 'human'

	const userMessagePayload = isHumanConversation
		? serializeMessage(
				await appendMessage({
					conversationId: conversation._id,
					senderType: 'user',
					senderId: clientId,
					senderName: String(clientName || '').trim(),
					content,
				}),
			)
		: createTransientMessage({
				conversationId: conversation._id,
				senderType: 'user',
				senderId: clientId,
				senderName: String(clientName || '').trim(),
				content,
			})

	if (isHumanConversation) {
		return {
			conversation: serializeConversation(hydratedConversation),
			userMessage: userMessagePayload,
			botMessage: null,
			systemMessage: null,
			requiresHuman: false,
			action: 'HUMAN_CHAT',
		}
	}

	let intentResult = {
		action: INTENTS.CHAT,
		intent: INTENTS.GENERAL_FAQ,
		confidence: 0,
		keyword: '',
		query: '',
		message: '',
		reason: '',
	}

	try {
		const history = await ChatMessage.find({ conversationId: conversation._id })
			.sort({ createdAt: -1 })
			.limit(8)
			.lean()

		intentResult = await classifyIntent({
			message: content,
			history: history.reverse().map((item) => ({
				senderType: item.senderType,
				content: item.content,
			})),
		})
	} catch {
		intentResult = {
			action: INTENTS.CHAT,
			intent: INTENTS.GENERAL_FAQ,
			confidence: 0,
			keyword: '',
			query: '',
			message: '',
			reason: 'classification_failed',
		}
	}

	const symptomKeyword = extractSymptomKeyword(content)
	const hasSymptomHint = SYMPTOM_QUERY_HINT_REGEX.test(normalizeText(content))
	if (symptomKeyword) {
		const productMatches = await searchProductsBySymptom(
			buildSymptomSearchQueries({
				content,
				symptomKeyword,
				intentResult,
			}),
		)
		const botReply = formatProductSuggestionText(productMatches)

		const botPayload = createTransientMessage({
			conversationId: conversation._id,
			senderType: 'bot',
			content: botReply,
			intent: INTENTS.QUERY_PRODUCT,
			action: INTENTS.FIND_PRODUCT,
			meta: {
				symptomKeyword,
				matcher: 'usageSummary_regex_fuzzy',
				productSuggestions: productMatches.map((item) => ({
					id: item.id,
					productName: item.productName,
					imageUrl: item.imageUrl,
					price: item.price,
					productUrl: `http://localhost:5173/product/${item.id}`,
				})),
			},
		})

		const nextStatus = isHumanPending ? 'human_pending' : 'ai'
		const updatedConversation = await touchConversation(conversation._id, {
			status: nextStatus,
			lastIntent: INTENTS.QUERY_PRODUCT,
			lastAction: INTENTS.FIND_PRODUCT,
		})

		return {
			conversation: serializeConversation(updatedConversation),
			userMessage: userMessagePayload,
			botMessage: botPayload,
			systemMessage: null,
			requiresHuman: nextStatus === 'human_pending',
			action: INTENTS.FIND_PRODUCT,
		}
	}

	if (hasSymptomHint) {
		const productMatches = await searchProductsBySymptom(
			buildSymptomSearchQueries({
				content,
				symptomKeyword: normalizeText(content),
				intentResult,
			}),
		)
		const botReply = formatProductSuggestionText(productMatches)

		const botPayload = createTransientMessage({
			conversationId: conversation._id,
			senderType: 'bot',
			content: botReply,
			intent: INTENTS.QUERY_PRODUCT,
			action: INTENTS.FIND_PRODUCT,
			meta: {
				symptomKeyword: normalizeText(content),
				matcher: 'symptom_hint_usageSummary_regex_fuzzy',
				productSuggestions: productMatches.map((item) => ({
					id: item.id,
					productName: item.productName,
					imageUrl: item.imageUrl,
					price: item.price,
					productUrl: `http://localhost:5173/product/${item.id}`,
				})),
			},
		})

		const nextStatus = isHumanPending ? 'human_pending' : 'ai'
		const updatedConversation = await touchConversation(conversation._id, {
			status: nextStatus,
			lastIntent: INTENTS.QUERY_PRODUCT,
			lastAction: INTENTS.FIND_PRODUCT,
		})

		return {
			conversation: serializeConversation(updatedConversation),
			userMessage: userMessagePayload,
			botMessage: botPayload,
			systemMessage: null,
			requiresHuman: nextStatus === 'human_pending',
			action: INTENTS.FIND_PRODUCT,
		}
	}

	let action = intentResult.action || intentResult.intent || INTENTS.CHAT
	if (action === INTENTS.GENERAL_FAQ) {
		action = INTENTS.CHAT
	}

	if (action === INTENTS.QUERY_PRODUCT) {
		action = INTENTS.FIND_PRODUCT
	}

	if (action === INTENTS.CALL_HUMAN) {
		action = INTENTS.CALL_ADMIN
	}

	const normalizedContent = normalizeText(content)
	const inferredProductLookup = PRODUCT_LOOKUP_HINT_REGEX.test(normalizedContent)
	const inferredOrderLookup =
		ORDER_LOOKUP_HINT_REGEX.test(normalizedContent) || Boolean(extractOrderCode(content))

	if (action === INTENTS.CHAT && inferredProductLookup) {
		action = INTENTS.FIND_PRODUCT
	}

	if (action === INTENTS.CALL_ADMIN && isHumanPending) {
		action = INTENTS.CHAT
	}

	if (action === INTENTS.CALL_ADMIN) {
		const humanFlow = await requestHumanFromClient(clientId, conversation._id, intentResult.reason || 'low_confidence')
		const botDoc = await appendMessage({
			conversationId: conversation._id,
			senderType: 'bot',
			content: 'Mình da chuyen cuoc tro chuyen sang nhan vien. Trong luc cho, ban van co the tiep tuc dat cau hoi de minh ho tro nhanh.',
			intent: intentResult.intent || INTENTS.CALL_HUMAN,
			action,
			meta: {
				confidence: intentResult.confidence,
				reason: intentResult.reason,
			},
		})

		return {
			conversation: humanFlow.conversation,
			userMessage: userMessagePayload,
			botMessage: serializeMessage(botDoc),
			systemMessage: humanFlow.systemMessage,
			requiresHuman: true,
			action,
		}
	}

	let dataPayload = {}
	if (action === INTENTS.FIND_PRODUCT || action === INTENTS.QUERY_PRODUCT) {
		dataPayload = {
			...dataPayload,
			products: await searchProducts(intentResult.keyword || intentResult.query || content),
		}
	}

	if (inferredOrderLookup) {
		dataPayload = {
			...dataPayload,
			orders: await searchOrdersForUser({
				clientId,
				query: intentResult.keyword || intentResult.query || content,
			}),
		}
	}

	const contextNoteParts = ['This is a pharmacy customer support chat.']
	if (isHumanPending) {
		contextNoteParts.push('A staff handoff is pending. Keep helping the customer while they wait.')
	}
	if (Array.isArray(dataPayload.products) && dataPayload.products.length > 0) {
		contextNoteParts.push('Product search data is included in Data.')
	}
	if (Array.isArray(dataPayload.orders) && dataPayload.orders.length > 0) {
		contextNoteParts.push('Order lookup data is included in Data.')
	}

	let botReply = ''
	let usedFallbackReply = false
	try {
		if (action === INTENTS.CHAT && intentResult.message && !inferredProductLookup && !inferredOrderLookup) {
			// Direct reply from AI classification
			botReply = intentResult.message
		} else if ((action === INTENTS.FIND_PRODUCT || action === INTENTS.QUERY_PRODUCT) && Array.isArray(dataPayload.products) && dataPayload.products.length > 0) {
			// Phase 2: Format product data + generate structured reply
			botReply = await generatePhase2Reply({
				userMessage: content,
				products: dataPayload.products,
				contextNote: contextNoteParts.join(' '),
			})
		} else {
			// Fallback to general data-driven generation
			botReply = await generateReplyFromData({
				userMessage: content,
				intent: intentResult.intent,
				action,
				dataSummary: summarizeForPrompt(dataPayload),
				contextNote: contextNoteParts.join(' '),
			})
		}
	} catch {
		usedFallbackReply = true
		botReply =
			buildDataDrivenFallbackReply({ action, dataPayload, queryText: content }) ||
			fallbackReplyByAction(action, { isHumanPending })
	}

	if (!botReply) {
		usedFallbackReply = true
		botReply =
			buildDataDrivenFallbackReply({ action, dataPayload, queryText: content }) ||
			fallbackReplyByAction(action, { isHumanPending })
	}

	if (isHumanPending && usedFallbackReply && action !== INTENTS.CALL_ADMIN && !/^Nhan vien dang duoc ket noi\./i.test(botReply)) {
		botReply = `Nhan vien dang duoc ket noi. ${botReply}`
	}

	const botPayload = createTransientMessage({
		conversationId: conversation._id,
		senderType: 'bot',
		content: botReply,
		intent: intentResult.intent || INTENTS.CHAT,
		action,
		meta: {
			confidence: intentResult.confidence,
			keyword: intentResult.keyword || intentResult.query,
			query: intentResult.query,
			reason: intentResult.reason,
		},
	})

	const nextStatus = isHumanPending ? 'human_pending' : 'ai'

	const updatedConversation = await touchConversation(conversation._id, {
		status: nextStatus,
		lastIntent: intentResult.intent || INTENTS.CHAT,
		lastAction: action,
	})

	return {
		conversation: serializeConversation(updatedConversation),
		userMessage: userMessagePayload,
		botMessage: botPayload,
		systemMessage: null,
		requiresHuman: nextStatus === 'human_pending',
		action,
	}
}

const handleStaffMessage = async ({ staffId, staffName = '', conversationId, content }) => {
	const { conversation } = await ensureStaffCanAccessConversation(staffId, conversationId)

	if (conversation.status !== 'human') {
		await touchConversation(conversation._id, {
			status: 'human',
			assignedStaffId: staffId,
			lastAction: 'HUMAN_CHAT',
		})
	}

	const adminMessage = await appendMessage({
		conversationId: conversation._id,
		senderType: 'admin',
		senderId: staffId,
		senderName: String(staffName || '').trim(),
		content,
		action: 'HUMAN_CHAT',
	})

	const updatedConversation = await ChatConversation.findById(conversation._id)
		.populate('clientId', 'fullName email phone role')
		.populate('assignedStaffId', 'fullName email phone role')

	return {
		conversation: serializeConversation(updatedConversation),
		message: serializeMessage(adminMessage),
	}
}

module.exports = {
	ChatServiceError,
	SUPPORT_ROLES,
	serializeConversation,
	serializeMessage,
	getClientConversationSnapshot,
	getClientMessages,
	requestHumanFromClient,
	assignConversationToStaff,
	closeConversationByStaff,
	listConversationsForAdmin,
	getConversationMessagesForAdmin,
	handleClientMessage,
	handleStaffMessage,
}
