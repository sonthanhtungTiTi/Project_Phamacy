const axios = require('axios')

const resolveOllamaApiUrl = () => {
	const configuredUrl =
		process.env.OLLAMA_API_URL ||
		process.env.OLLAMA_BASE_URL ||
		process.env.OLLAMA_HOST ||
		'http://localhost:11434/api/generate'

	const normalized = String(configuredUrl || '').trim().replace(/\/$/, '')
	if (!normalized) {
		return 'http://localhost:11434/api/generate'
	}

	if (normalized.endsWith('/api/generate')) {
		return normalized
	}

	return `${normalized}/api/generate`
}

const OLLAMA_API_URL = resolveOllamaApiUrl()
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b'

const ACTIONS = {
	FIND_PRODUCT: 'FIND_PRODUCT',
	CHAT: 'CHAT',
	CALL_ADMIN: 'CALL_ADMIN',
}

const INTENTS = {
	FIND_PRODUCT: ACTIONS.FIND_PRODUCT,
	CHAT: ACTIONS.CHAT,
	CALL_ADMIN: ACTIONS.CALL_ADMIN,
	GENERAL_FAQ: ACTIONS.CHAT,
	QUERY_PRODUCT: ACTIONS.FIND_PRODUCT,
	QUERY_ORDER: ACTIONS.CHAT,
	CALL_HUMAN: ACTIONS.CALL_ADMIN,
}

const ALLOWED_ACTIONS = new Set(Object.values(ACTIONS))

const normalizeText = (value = '') =>
	String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()

const PRODUCT_HINT_REGEX = /\b(tim|tra\s?cuu|san\s?pham|thuoc|gia|hoat\s?chat)\b/i
const CALL_ADMIN_HINT_REGEX = /\b(nhan\s?vien|admin|nguoi\s?that|tu\s?van\s?truc\s?tiep|ho\s?tro\s?truc\s?tiep|ket\s?noi\s?nhan\s?vien)\b/i

const cleanJsonString = (text = '') => {
	let value = String(text || '').trim()
	if (!value) {
		return '{}'
	}

	value = value
		.replace(/```json/gi, '')
		.replace(/```/g, '')
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.trim()

	const start = value.indexOf('{')
	const end = value.lastIndexOf('}')
	if (start >= 0 && end > start) {
		value = value.slice(start, end + 1)
	}

	value = value.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
	value = value.replace(/'/g, '"')
	value = value.replace(/,\s*([}\]])/g, '$1')

	const openCurly = (value.match(/{/g) || []).length
	const closeCurly = (value.match(/}/g) || []).length
	if (openCurly > closeCurly) {
		value += '}'.repeat(openCurly - closeCurly)
	}

	const openSquare = (value.match(/\[/g) || []).length
	const closeSquare = (value.match(/\]/g) || []).length
	if (openSquare > closeSquare) {
		value += ']'.repeat(openSquare - closeSquare)
	}

	return value
}

const parseOllamaJson = (rawText, fallback = {}) => {
	const cleaned = cleanJsonString(rawText)

	try {
		return JSON.parse(cleaned)
	} catch {
		return fallback
	}
}

const normalizeAction = (value) => {
	const upper = String(value || '').trim().toUpperCase()
	return ALLOWED_ACTIONS.has(upper) ? upper : ACTIONS.CHAT
}

const inferActionFromUserMessage = (message = '', keyword = '') => {
	const combined = normalizeText(`${String(message || '')} ${String(keyword || '')}`.trim())

	if (CALL_ADMIN_HINT_REGEX.test(combined)) {
		return ACTIONS.CALL_ADMIN
	}

	if (PRODUCT_HINT_REGEX.test(combined)) {
		return ACTIONS.FIND_PRODUCT
	}

	return ACTIONS.CHAT
}

const callOllama = async ({ prompt, system = '', temperature = 0.2, format } = {}) => {
	const requestPayload = {
		model: OLLAMA_MODEL,
		prompt,
		system,
		stream: false,
		options: {
			temperature,
		},
	}

	if (format !== undefined && format !== null && String(format).trim() !== '') {
		requestPayload.format = format
	}

	const response = await axios.post(
		OLLAMA_API_URL,
		requestPayload,
		{
			timeout: Number(process.env.OLLAMA_TIMEOUT_MS || 20000),
		},
	)

	return String(response?.data?.response || '').trim()
}

const classifyIntent = async ({ message, history = [] }) => {
	const compactHistory = history
		.slice(-6)
		.map((item) => `${item.senderType}: ${String(item.content || '').slice(0, 200)}`)
		.join('\n')

	const systemPrompt = `Ban la bo dieu phoi chat agent cho nha thuoc.
Chi tra ve JSON hop le, khong markdown, khong giai thich.
Schema bat buoc:
{"action":"FIND_PRODUCT|CHAT|CALL_ADMIN","keyword":"string","message":"string"}
Quy tac:
- FIND_PRODUCT: khi khach muon tim, hoi, so sanh san pham/thuoc.
- CALL_ADMIN: khi khach yeu cau gap nguoi that, tu van truc tiep, khieu nai, hoac AI khong chac chan.
- CHAT: cac truong hop con lai, message la cau tra loi ngan gon bang tieng Viet.`

	const prompt = [
		'Chon duy nhat 1 action thuc te cho cau cua khach (khong duoc tra ve danh sach action).',
		`Lich su hoi thoai gan day:\n${compactHistory || '(empty)'}`,
		`Khach hang noi: "${String(message || '')}"`,
		'Return JSON now.',
	].join('\n\n')

	const raw = await callOllama({
		prompt,
		system: systemPrompt,
		temperature: 0,
		format: 'json',
	})

	const parsed = parseOllamaJson(raw, {})
	const rawAction = String(parsed.action || '').trim()
	let action = normalizeAction(rawAction)
	const keyword = String(parsed.keyword || parsed.query || '').trim()
	const messageText = String(parsed.message || '').trim()
	const inferredAction = inferActionFromUserMessage(message, keyword)
	const explicitHumanRequest = CALL_ADMIN_HINT_REGEX.test(normalizeText(message))

	const hasAmbiguousAction = rawAction.includes('|') || rawAction.includes(',')
	if (!ALLOWED_ACTIONS.has(rawAction.toUpperCase()) || hasAmbiguousAction) {
		action = inferredAction
	}

	if (explicitHumanRequest || inferredAction === ACTIONS.CALL_ADMIN) {
		action = ACTIONS.CALL_ADMIN
	} else if (action === ACTIONS.CHAT && inferredAction === ACTIONS.FIND_PRODUCT) {
		action = ACTIONS.FIND_PRODUCT
	}

	const compatibilityIntent =
		action === ACTIONS.FIND_PRODUCT
			? INTENTS.QUERY_PRODUCT
			: action === ACTIONS.CALL_ADMIN
				? INTENTS.CALL_HUMAN
				: INTENTS.GENERAL_FAQ

	return {
		action,
		keyword,
		message: messageText,
		intent: compatibilityIntent,
		confidence: 1,
		query: keyword,
		reason: '',
		raw,
	}
}

const generateReplyFromData = async ({ userMessage, intent, action, dataSummary, contextNote = '' }) => {
	const systemPrompt = [
		'You are a friendly pharmacy support assistant.',
		'Respond in Vietnamese, concise, practical, and polite.',
		'Only use provided facts. If data is empty, explain clearly and suggest human support.',
	].join(' ')

	const prompt = [
		`Intent: ${intent}`,
		`Action: ${action}`,
		`Context: ${contextNote || 'N/A'}`,
		`Data: ${dataSummary || 'NO_DATA'}`,
		`User message: ${String(userMessage || '')}`,
		'Write the final customer-facing response.',
	].join('\n\n')

	return callOllama({ prompt, system: systemPrompt, temperature: 0.35 })
}

module.exports = {
	ACTIONS,
	INTENTS,
	cleanJsonString,
	parseOllamaJson,
	classifyIntent,
	generateReplyFromData,
}
