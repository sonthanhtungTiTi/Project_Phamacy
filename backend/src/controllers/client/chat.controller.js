const chatService = require('../../services/chat/chat.service')

const getMyConversation = async (req, res) => {
	try {
		const userId = req.user?.userId
		const limit = req.query?.limit
		const data = await chatService.getClientConversationSnapshot(userId, { limit })

		return res.status(200).json({
			success: true,
			message: 'Conversation loaded successfully',
			data,
		})
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || 'Load conversation failed',
			error: error.message,
		})
	}
}

const getMyMessages = async (req, res) => {
	try {
		const userId = req.user?.userId
		const conversationId = req.query?.conversationId
		const limit = req.query?.limit

		const data = conversationId
			? await chatService.getClientMessages(userId, conversationId, { limit })
			: await chatService.getClientConversationSnapshot(userId, { limit })

		return res.status(200).json({
			success: true,
			message: 'Messages loaded successfully',
			data,
		})
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || 'Load messages failed',
			error: error.message,
		})
	}
}

const requestHumanSupport = async (req, res) => {
	try {
		const userId = req.user?.userId
		const { conversationId, reason } = req.body || {}
		const data = await chatService.requestHumanFromClient(userId, conversationId || null, reason || '')

		return res.status(200).json({
			success: true,
			message: 'Human support requested successfully',
			data,
		})
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || 'Request human support failed',
			error: error.message,
		})
	}
}

module.exports = {
	getMyConversation,
	getMyMessages,
	requestHumanSupport,
}
