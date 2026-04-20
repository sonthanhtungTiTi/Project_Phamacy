const jwt = require('jsonwebtoken')
const registerChatHandlers = require('./chatHandler')

// Theo dõi người dùng đang online: userId -> { userId, role, name, socketIds:Set }
const onlineUsers = new Map()

const serializeOnlineUsers = () =>
    Array.from(onlineUsers.values()).map((user) => ({
        userId: user.userId,
        role: user.role,
        name: user.name,
        socketCount: user.socketIds.size,
    }))

const setupCallHandlers = (io) => {
    // ==================== 1. MIDDLEWARE XÁC THỰC ====================
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

        if (!token) {
            console.log('[Socket] No token provided')
            return next(new Error('Authentication error: No token provided'))
        }

        try {
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token
            const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'dev-secret-change-me')

            const resolvedUserId = decoded.userId || decoded.id || decoded.sub || decoded._id
            if (!resolvedUserId) {
                return next(new Error('Authentication error: Missing userId in token'))
            }

            socket.userId = String(resolvedUserId)
            socket.userRole = decoded.role
            socket.userName = decoded.fullName || decoded.name || 'Người dùng'

            next()
        } catch (err) {
            console.error('[Socket] Auth error:', err.message)
            return next(new Error('Authentication error: Invalid token'))
        }
    })

    // ==================== 2. XỬ LÝ KẾT NỐI ====================
    io.on('connection', (socket) => {
        console.log(`✅ Khách kết nối: ${socket.id} (User: ${socket.userName} - ID: ${socket.userId})`)

        // Đưa socket vào room userId sau khi đã kết nối thành công.
        socket.join(socket.userId)

        // Lưu nhiều socket cho cùng 1 user (multi-tab / multi-device).
        const existingUser = onlineUsers.get(socket.userId)
        if (existingUser) {
            existingUser.socketIds.add(socket.id)
            existingUser.role = socket.userRole || existingUser.role
            existingUser.name = socket.userName || existingUser.name
        } else {
            onlineUsers.set(socket.userId, {
                userId: socket.userId,
                role: socket.userRole,
                name: socket.userName,
                socketIds: new Set([socket.id]),
            })
        }
        
        // Báo cho toàn hệ thống biết có người mới online (để update UI danh sách người gọi)
        io.emit('online-users:update', serializeOnlineUsers())

        // Lấy danh sách người dùng online
        socket.on('get-online-users', (callback) => {
            if (typeof callback === 'function') {
                callback(serializeOnlineUsers())
            }
        })

        // ==================== 3. CHAT AI + HUMAN SUPPORT ====================
        registerChatHandlers({ io, socket, onlineUsers })

        // ==================== 4. WEBRTC SIGNALING LOGIC ====================
        // Gửi yêu cầu gọi
        socket.on('call:initiate', ({ targetUserId, callType, callId, callerData }) => {
            if (!targetUserId) return
            console.log(`[CALL] ${socket.userId} đang gọi ${targetUserId} (${callType})`)
            
            // Bắn tín hiệu sang phòng của người nhận (targetUserId)
            socket.to(targetUserId.toString()).emit('call:incoming', {
                callId,
                callerId: socket.userId.toString(),
                callType,
                callerData: callerData || {
                    userId: socket.userId.toString(),
                    name: socket.userName,
                    role: socket.userRole,
                }, // Thông tin để hiển thị trên UI người nghe
            })
        })

        // Gửi SDP Offer
        socket.on('call:offer', ({ targetUserId, callId, offer }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:offer', {
                callId,
                callerId: socket.userId.toString(),
                offer,
            })
        })

        // Gửi SDP Answer
        socket.on('call:answer', ({ targetUserId, callId, answer }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:answer', {
                callId,
                calleeId: socket.userId.toString(),
                answer,
            })
        })

        // Gửi ICE Candidates (Network pathways)
        socket.on('call:ice-candidate', ({ targetUserId, callId, candidate }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:ice-candidate', {
                callId,
                senderId: socket.userId.toString(),
                candidate,
            })
        })

        // Hủy gọi / Từ chối / Kết thúc
        socket.on('call:cancel', ({ targetUserId, callId }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:cancel', {
                callId,
                senderId: socket.userId.toString(),
            })
        })

        socket.on('call:reject', ({ targetUserId, callId }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:reject', {
                callId,
                senderId: socket.userId.toString(),
            })
        })

        socket.on('call:end', ({ targetUserId, callId }) => {
            if (!targetUserId) return
            socket.to(targetUserId.toString()).emit('call:end', {
                callId,
                senderId: socket.userId.toString(),
            })
        })

        // ==================== 5. NGẮT KẾT NỐI ====================
        socket.on('disconnect', () => {
            console.log(`🔌 Khách rời đi: ${socket.id} (User ID: ${socket.userId})`)

            const existingUser = onlineUsers.get(socket.userId)
            if (existingUser) {
                existingUser.socketIds.delete(socket.id)
                if (existingUser.socketIds.size === 0) {
                    onlineUsers.delete(socket.userId)
                }
            }

            // Báo lại danh sách online mới nhất rà soát UI
            io.emit('online-users:update', serializeOnlineUsers())
        })
    })

    console.log('✅ Socket.io Call Handlers Initialized (Point-to-Point Mode)')
}

module.exports = setupCallHandlers
module.exports.onlineUsers = onlineUsers
