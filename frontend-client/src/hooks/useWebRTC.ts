/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react'

export type CallPhase = 'idle' | 'outgoing' | 'incoming' | 'connected'

export interface IncomingCallData {
    callId: string
    callerId: string
    callerName: string
    callerAvatarUrl?: string
    callType: 'video' | 'voice'
}

interface UseWebRTCOptions {
    onPhaseChange?: (phase: CallPhase) => void
    onIncomingCall?: (data: IncomingCallData) => void
}

interface PendingOfferData {
    callId: string
    fromUserId: string
    offer: RTCSessionDescriptionInit
    callType: 'video' | 'voice'
}

const RTC_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
    ],
}

const SIGNALING_EVENTS = {
    initiate: 'call:initiate',
    incoming: 'call:incoming',
    offer: 'call:offer',
    answer: 'call:answer',
    iceCandidate: 'call:ice-candidate',
    reject: 'call:reject',
    cancel: 'call:cancel',
    end: 'call:end',
} as const

const generateCallId = () => `call_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

const normalizeCallType = (callType: string | undefined): 'video' | 'voice' =>
    callType === 'voice' ? 'voice' : 'video'

const getUserId = (user: any): string => String(user?.userId || user?._id || user?.id || '')

const getUserName = (user: any): string => user?.fullName || user?.name || 'Nguoi dung'

const getUserAvatar = (user: any): string | undefined => user?.profilePic || user?.avatarUrl

export const useWebRTC = (socket: any, user: any, options?: UseWebRTCOptions) => {
    const [phase, setPhase] = useState<CallPhase>('idle')
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null)
    const [localStream, setLocalStream] = useState<MediaStream | null>(null)
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOn, setIsVideoOn] = useState(false)
    const [callType, setCallType] = useState<'video' | 'voice'>('video')

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)
    const remoteStreamRef = useRef<MediaStream | null>(null)
    const currentCallRef = useRef<{ callId: string; peerId: string } | null>(null)
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([])
    const pendingOfferRef = useRef<PendingOfferData | null>(null)
    const phaseRef = useRef<CallPhase>('idle')
    const incomingCallRef = useRef<IncomingCallData | null>(null)
    const callTypeRef = useRef<'video' | 'voice'>('video')
    const optionsRef = useRef<UseWebRTCOptions | undefined>(options)

    useEffect(() => {
        optionsRef.current = options
    }, [options])

    useEffect(() => {
        incomingCallRef.current = incomingCall
    }, [incomingCall])

    const setCallPhase = useCallback((nextPhase: CallPhase) => {
        phaseRef.current = nextPhase
        setPhase(nextPhase)
        optionsRef.current?.onPhaseChange?.(nextPhase)
    }, [])

    const closePeerConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
            peerConnectionRef.current = null
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop())
            localStreamRef.current = null
        }

        remoteStreamRef.current = null
        currentCallRef.current = null
        pendingCandidatesRef.current = []
        pendingOfferRef.current = null

        setLocalStream(null)
        setRemoteStream(null)
        setIsMuted(false)
        setIsVideoOn(false)
    }, [])

    const initializeUserMedia = useCallback(async (enableVideo: boolean) => {
        if (localStreamRef.current) {
            return localStreamRef.current
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: enableVideo
                    ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    }
                    : false,
            })

            localStreamRef.current = stream
            setLocalStream(stream)
            setIsVideoOn(enableVideo && stream.getVideoTracks().length > 0)
            return stream
        } catch {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            })

            localStreamRef.current = audioOnlyStream
            setLocalStream(audioOnlyStream)
            setIsVideoOn(false)
            return audioOnlyStream
        }
    }, [])

    const createPeerConnection = useCallback(async () => {
        if (peerConnectionRef.current) {
            return peerConnectionRef.current
        }

        const peerConnection = new RTCPeerConnection(RTC_CONFIG)

        if (!localStreamRef.current) {
            await initializeUserMedia(callTypeRef.current === 'video')
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                if (localStreamRef.current) {
                    peerConnection.addTrack(track, localStreamRef.current)
                }
            })
        }

        peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0]
                setRemoteStream(event.streams[0])
            }
        }

        peerConnection.onicecandidate = (event) => {
            if (!event.candidate || !socket || !currentCallRef.current) return

            socket.emit(SIGNALING_EVENTS.iceCandidate, {
                callId: currentCallRef.current.callId,
                targetUserId: currentCallRef.current.peerId,
                candidate: event.candidate,
            })
        }

        peerConnection.onconnectionstatechange = () => {
            if (peerConnection.connectionState === 'connected') {
                setCallPhase('connected')
            }

            if (peerConnection.connectionState === 'failed') {
                closePeerConnection()
                setCallPhase('idle')
            }
        }

        peerConnectionRef.current = peerConnection
        return peerConnection
    }, [closePeerConnection, initializeUserMedia, setCallPhase, socket])

    const initiateCall = useCallback(
        async (peerId: string, _peerName: string, type: 'video' | 'voice' = 'video') => {
            if (!socket || !peerId) {
                return
            }

            try {
                callTypeRef.current = type
                setCallType(type)

                const callId = generateCallId()
                currentCallRef.current = { callId, peerId }

                setCallPhase('outgoing')

                const peerConnection = await createPeerConnection()
                const offer = await peerConnection.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: type === 'video',
                })

                await peerConnection.setLocalDescription(offer)

                socket.emit(SIGNALING_EVENTS.initiate, {
                    callId,
                    targetUserId: peerId,
                    callType: type,
                    callerData: {
                        userId: getUserId(user),
                        name: getUserName(user),
                        avatar: getUserAvatar(user),
                    },
                })

                socket.emit(SIGNALING_EVENTS.offer, {
                    callId,
                    targetUserId: peerId,
                    offer,
                })
            } catch (error) {
                closePeerConnection()
                setCallPhase('idle')
                throw error
            }
        },
        [closePeerConnection, createPeerConnection, setCallPhase, socket, user]
    )

    const answerCall = useCallback(async () => {
        const callToAnswer = incomingCallRef.current
        const offerData = pendingOfferRef.current

        if (!callToAnswer || !offerData || !socket) return

        try {
            currentCallRef.current = {
                callId: offerData.callId,
                peerId: callToAnswer.callerId,
            }

            callTypeRef.current = callToAnswer.callType
            setCallType(callToAnswer.callType)

            const peerConnection = await createPeerConnection()

            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offerData.offer)
            )

            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            socket.emit(SIGNALING_EVENTS.answer, {
                callId: offerData.callId,
                targetUserId: callToAnswer.callerId,
                answer,
            })

            pendingCandidatesRef.current.forEach((candidate) => {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {
                    return
                })
            })
            pendingCandidatesRef.current = []

            setIncomingCall(null)
            incomingCallRef.current = null
            pendingOfferRef.current = null
            setCallPhase('connected')
        } catch {
            closePeerConnection()
            setCallPhase('idle')
        }
    }, [closePeerConnection, createPeerConnection, setCallPhase, socket])

    const handleIncoming = useCallback(
        (data: any) => {
            const callerId = String(data?.callerId || data?.fromUserId || '')
            if (!callerId) return

            const ct = normalizeCallType(data?.callType)
            const incomingData: IncomingCallData = {
                callId: data?.callId || generateCallId(),
                callerId,
                callerName: data?.callerData?.name || data?.callerName || 'Nguoi dung',
                callerAvatarUrl: data?.callerData?.avatar || data?.callerAvatarUrl,
                callType: ct,
            }

            const currentCallId = currentCallRef.current?.callId || incomingCallRef.current?.callId
            const isSameCall = currentCallId ? incomingData.callId === currentCallId : false

            if (phaseRef.current !== 'idle' && !isSameCall) {
                socket?.emit(SIGNALING_EVENTS.reject, {
                    callId: incomingData.callId,
                    targetUserId: callerId,
                })
                return
            }

            callTypeRef.current = ct
            setCallType(ct)
            setIncomingCall(incomingData)
            incomingCallRef.current = incomingData
            setCallPhase('incoming')
            optionsRef.current?.onIncomingCall?.(incomingData)
        },
        [setCallPhase, socket]
    )

    const handleOffer = useCallback(
        (data: any) => {
            const callerId = String(data?.callerId || data?.fromUserId || '')
            const normalizedOffer = data?.offer || data?.sdp

            if (!callerId || !normalizedOffer) return

            const callId = data?.callId || incomingCallRef.current?.callId || generateCallId()
            const ct = normalizeCallType(data?.callType || incomingCallRef.current?.callType)

            const currentCallId = currentCallRef.current?.callId || incomingCallRef.current?.callId
            const isSameCall = currentCallId ? callId === currentCallId : false

            if (phaseRef.current !== 'idle' && !isSameCall) {
                socket?.emit(SIGNALING_EVENTS.reject, {
                    callId,
                    targetUserId: callerId,
                })
                return
            }

            pendingOfferRef.current = {
                callId,
                fromUserId: callerId,
                offer: normalizedOffer,
                callType: ct,
            }

            if (!incomingCallRef.current) {
                const incomingData: IncomingCallData = {
                    callId,
                    callerId,
                    callerName: data?.callerData?.name || data?.callerName || 'Nguoi dung',
                    callerAvatarUrl: data?.callerData?.avatar || data?.callerAvatarUrl,
                    callType: ct,
                }

                setIncomingCall(incomingData)
                incomingCallRef.current = incomingData
                setCallPhase('incoming')
                optionsRef.current?.onIncomingCall?.(incomingData)
            }
        },
        [setCallPhase, socket]
    )

    const handleAnswer = useCallback(
        async (data: any) => {
            if (!currentCallRef.current) return
            if (data?.callId && data.callId !== currentCallRef.current.callId) return

            const normalizedAnswer = data?.answer || data?.sdp
            if (!normalizedAnswer) return

            const peerConnection = peerConnectionRef.current
            if (!peerConnection) return

            const responderId = String(data?.calleeId || data?.fromUserId || '')
            if (responderId && currentCallRef.current.peerId !== responderId) {
                currentCallRef.current.peerId = responderId
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(normalizedAnswer))

            pendingCandidatesRef.current.forEach((candidate) => {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {
                    return
                })
            })
            pendingCandidatesRef.current = []

            setCallPhase('connected')
        },
        [setCallPhase]
    )

    const handleIceCandidate = useCallback(async (data: any) => {
        if (!data?.candidate) return

        const expectedCallId =
            currentCallRef.current?.callId || incomingCallRef.current?.callId || pendingOfferRef.current?.callId
        if (expectedCallId && data?.callId && data.callId !== expectedCallId) return

        const peerConnection = peerConnectionRef.current
        if (!peerConnection || !peerConnection.remoteDescription) {
            pendingCandidatesRef.current.push(data.candidate)
            return
        }

        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch {
            return
        }
    }, [])

    const clearCallState = useCallback(() => {
        setIncomingCall(null)
        incomingCallRef.current = null
        closePeerConnection()
        setCallPhase('idle')
    }, [closePeerConnection, setCallPhase])

    const endCall = useCallback(() => {
        if (socket && currentCallRef.current) {
            socket.emit(SIGNALING_EVENTS.end, {
                callId: currentCallRef.current.callId,
                targetUserId: currentCallRef.current.peerId,
            })
        }

        clearCallState()
    }, [clearCallState, socket])

    const rejectCall = useCallback(() => {
        if (socket && incomingCallRef.current) {
            socket.emit(SIGNALING_EVENTS.reject, {
                callId: incomingCallRef.current.callId,
                targetUserId: incomingCallRef.current.callerId,
            })
        }

        clearCallState()
    }, [clearCallState, socket])

    const toggleAudio = useCallback(() => {
        if (!localStreamRef.current) return

        localStreamRef.current.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled
        })

        setIsMuted((prev) => !prev)
    }, [])

    const toggleVideo = useCallback(() => {
        if (!localStreamRef.current) return

        const tracks = localStreamRef.current.getVideoTracks()
        if (!tracks.length) return

        const nextValue = !isVideoOn
        tracks.forEach((track) => {
            track.enabled = nextValue
        })
        setIsVideoOn(nextValue)
    }, [isVideoOn])

    useEffect(() => {
        if (!socket) return

        const handleRemoteEnd = (data: any) => {
            const expectedCallId =
                currentCallRef.current?.callId || incomingCallRef.current?.callId || pendingOfferRef.current?.callId

            if (expectedCallId && data?.callId && data.callId !== expectedCallId) return
            clearCallState()
        }

        socket.on(SIGNALING_EVENTS.incoming, handleIncoming)
        socket.on(SIGNALING_EVENTS.offer, handleOffer)
        socket.on(SIGNALING_EVENTS.answer, handleAnswer)
        socket.on(SIGNALING_EVENTS.iceCandidate, handleIceCandidate)
        socket.on(SIGNALING_EVENTS.end, handleRemoteEnd)
        socket.on(SIGNALING_EVENTS.cancel, handleRemoteEnd)
        socket.on(SIGNALING_EVENTS.reject, handleRemoteEnd)

        return () => {
            socket.off(SIGNALING_EVENTS.incoming, handleIncoming)
            socket.off(SIGNALING_EVENTS.offer, handleOffer)
            socket.off(SIGNALING_EVENTS.answer, handleAnswer)
            socket.off(SIGNALING_EVENTS.iceCandidate, handleIceCandidate)
            socket.off(SIGNALING_EVENTS.end, handleRemoteEnd)
            socket.off(SIGNALING_EVENTS.cancel, handleRemoteEnd)
            socket.off(SIGNALING_EVENTS.reject, handleRemoteEnd)
        }
    }, [clearCallState, handleAnswer, handleIceCandidate, handleIncoming, handleOffer, socket])

    useEffect(() => {
        return () => {
            if (phaseRef.current !== 'idle') {
                closePeerConnection()
            }
        }
    }, [closePeerConnection])

    return {
        phase,
        callType,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        isVideoOn,
        initiateCall,
        answerCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
    }
}
