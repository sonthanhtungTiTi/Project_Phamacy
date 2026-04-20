const axios = require('axios')

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3'

const INTENTS = {
	GENERAL_FAQ: 'GENERAL_FAQ',
	QUERY_PRODUCT: 'QUERY_PRODUCT',
	QUERY_ORDER: 'QUERY_ORDER',
	CALL_HUMAN: 'CALL_HUMAN',
}

const ALLOWED_INTENTS = new Set(Object.values(INTENTS))

const extractFirstJsonObject = (text = '') => {
	const start = text.indexOf('{')
	const end = text.lastIndexOf('}')
	if (start < 0 || end < 0 || end <= start) {
		return null
	}

	const jsonSnippet = text.slice(start, end + 1)
	try {
		return JSON.parse(jsonSnippet)
	} catch {
		return null
	}
}

const normalizeIntent = (intent) => {
	const upper = String(intent || '').trim().toUpperCase()
	return ALLOWED_INTENTS.has(upper) ? upper : INTENTS.GENERAL_FAQ
}

const toSafeConfidence = (value) => {
	const numeric = Number(value)
	if (Number.isNaN(numeric)) {
		return 0
	}
	return Math.max(0, Math.min(1, numeric))
}

const callOllama = async ({ prompt, system = '', temperature = 0.2 }) => {
	const response = await axios.post(
		OLLAMA_API_URL,
		{
			model: OLLAMA_MODEL,
			prompt,
			system,
			stream: false,
			options: {
				temperature,
			},
		},
		{
			timeout: Number(process.env.OLLAMA_TIMEOUT_MS || 20000),
		},
	)

	return String(response?.data?.response || '').trim()
}

const classifyIntent = async ({ message, history = [] }) => {
	const compactHistory = history
		.slice(-6)
		.map((item) => `${item.senderType}: ${String(item.content || '').slice(0, 300)}`)
		.join('\n')

	const systemPrompt = [
		'You are an intent classifier for a pharmacy support chatbot.',
		'Return JSON only with this exact shape:',
		'{"intent":"GENERAL_FAQ|QUERY_PRODUCT|QUERY_ORDER|CALL_HUMAN","confidence":0.0,"query":"string","reason":"string"}',
		'No markdown, no explanation, no extra keys.',
	].join(' ')

	const prompt = [
		`Conversation history:\n${compactHistory || '(empty)'}`,
		`User message: ${String(message || '')}`,
		'Classify now.',
	].join('\n\n')

	const raw = await callOllama({ prompt, system: systemPrompt, temperature: 0 })
	const parsed = extractFirstJsonObject(raw) || {}

	return {
		intent: normalizeIntent(parsed.intent),
		confidence: toSafeConfidence(parsed.confidence),
		query: String(parsed.query || '').trim(),
		reason: String(parsed.reason || '').trim(),
		raw,
	}
}

const generateReplyFromData = async ({ userMessage, intent, action, dataSummary, contextNote = '' }) => {
	const systemPrompt = [
		'You are a friendly pharmacy support assistant.',
		'Respond in Vietnamese, concise, practical, and polite.',
		'Only use provided facts. If data is empty, say you could not find exact records and ask if user wants human support.',
	].join(' ')

	const prompt = [
		`Intent: ${intent}`,
		`Action: ${action}`,
		`Context: ${contextNote || 'N/A'}`,
		`Data: ${dataSummary || 'NO_DATA'}`,
		`User message: ${String(userMessage || '')}`,
		'Write the final customer-facing response.',
	].join('\n\n')

	return callOllama({ prompt, system: systemPrompt, temperature: 0.4 })
}

module.exports = {
	INTENTS,
	classifyIntent,
	generateReplyFromData,
}
