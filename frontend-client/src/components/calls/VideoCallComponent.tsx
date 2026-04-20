import { useEffect, useRef } from 'react'
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import type { CallPhase } from '@/hooks/useWebRTCCall'

interface VideoCallOverlayProps {
	phase: CallPhase
	callType: 'video' | 'voice'
	peerName: string
	peerAvatarUrl?: string
	durationSec: number
	isMuted: boolean
	isVideoOn: boolean
	onMicToggle: () => void
	onVideoToggle: () => void
	onAnswer?: () => void
	onReject?: () => void
	onHangup: () => void
	localStream: MediaStream | null
	remoteStream: MediaStream | null
}

const formatDuration = (sec: number) => {
	const minutes = Math.floor(sec / 60)
	const seconds = sec % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function VideoCallOverlay({
	phase,
	callType,
	peerName,
	peerAvatarUrl,
	durationSec,
	isMuted,
	isVideoOn,
	onMicToggle,
	onVideoToggle,
	onAnswer,
	onReject,
	onHangup,
	localStream,
	remoteStream,
}: VideoCallOverlayProps) {
	const localVideoRef = useRef<HTMLVideoElement>(null)
	const remoteVideoRef = useRef<HTMLVideoElement>(null)

	useEffect(() => {
		if (localVideoRef.current && localStream) {
			localVideoRef.current.srcObject = localStream
		}
	}, [localStream])

	useEffect(() => {
		if (remoteVideoRef.current && remoteStream) {
			remoteVideoRef.current.srcObject = remoteStream
		}
	}, [remoteStream])

	const hasRemoteVideo = !!remoteStream && remoteStream.getVideoTracks().length > 0
	const hasLocalVideo = !!localStream && localStream.getVideoTracks().length > 0
	const isVideoCall = callType === 'video'

	const avatarInitial = (peerName || 'U').trim().charAt(0).toUpperCase()

	// ==================== INCOMING CALL ====================
	if (phase === 'incoming') {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-sm">
				<div className="flex flex-col items-center text-center text-white px-6">
					{/* Avatar with pulse animation */}
					<div className="relative mb-6">
						<div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
						<div className="relative w-28 h-28 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center overflow-hidden">
							{peerAvatarUrl ? (
								<img src={peerAvatarUrl} alt={peerName} className="w-full h-full object-cover" />
							) : (
								<span className="text-5xl font-bold">{avatarInitial}</span>
							)}
						</div>
					</div>

					<h2 className="text-3xl font-bold mb-2">{peerName}</h2>
					<p className="text-white/80 mb-2">
						{isVideoCall ? '📹 Cuộc gọi video đến' : '📞 Cuộc gọi thoại đến'}
					</p>

					{/* Ringing dots */}
					<div className="flex gap-2 mb-8">
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
					</div>

					{/* Action buttons */}
					<div className="flex items-center gap-16">
						<div className="flex flex-col items-center">
							<button
								className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
								onClick={onReject}
								aria-label="Từ chối"
							>
								<PhoneOff size={24} />
							</button>
							<span className="mt-2 text-sm text-white/80">Từ chối</span>
						</div>

						<div className="flex flex-col items-center">
							<button
								className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
								onClick={onAnswer}
								aria-label="Trả lời"
							>
								<Phone size={24} />
							</button>
							<span className="mt-2 text-sm text-white/80">Trả lời</span>
						</div>
					</div>
				</div>
			</div>
		)
	}

	// ==================== OUTGOING CALL ====================
	if (phase === 'outgoing') {
		return (
			<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-sm text-white">
				{/* Local preview for video calls */}
				{isVideoCall && hasLocalVideo && (
					<div className="absolute inset-0 opacity-20">
						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				<div className="relative z-10 flex flex-col items-center">
					<div className="w-28 h-28 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center overflow-hidden mb-6">
						{peerAvatarUrl ? (
							<img src={peerAvatarUrl} alt={peerName} className="w-full h-full object-cover" />
						) : (
							<span className="text-5xl font-bold">{avatarInitial}</span>
						)}
					</div>

					<h2 className="text-3xl font-bold mb-2">{peerName}</h2>
					<p className="text-white/80 mb-1">Đang gọi...</p>
					<p className="text-white/60 text-sm mb-6">Đang chờ người nhận bắt máy</p>

					{/* Calling animation dots */}
					<div className="flex gap-2 mb-8">
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
						<span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
					</div>

					<button
						className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-all hover:scale-110"
						onClick={onHangup}
						aria-label="Hủy cuộc gọi"
					>
						<PhoneOff size={24} />
					</button>
					<span className="mt-2 text-sm text-white/80">Hủy cuộc gọi</span>
				</div>
			</div>
		)
	}

	// ==================== CONNECTED CALL ====================
	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
			{/* Remote video/audio area */}
			<div className="flex-1 relative">
				{isVideoCall && hasRemoteVideo ? (
					<video
						ref={remoteVideoRef}
						autoPlay
						playsInline
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
						<div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/30 flex items-center justify-center overflow-hidden mb-4">
							{peerAvatarUrl ? (
								<img src={peerAvatarUrl} alt={peerName} className="w-full h-full object-cover" />
							) : (
								<span className="text-6xl font-bold">{avatarInitial}</span>
							)}
						</div>
						<p className="text-2xl font-bold">{peerName}</p>
						{!isVideoCall && (
							<span className="text-emerald-400 mt-2">{formatDuration(durationSec)}</span>
						)}
					</div>
				)}

				{/* Top bar */}
				<div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
					<div className="flex items-center justify-between text-white">
						<div>
							<h3 className="font-semibold text-lg">{peerName}</h3>
							<span className="text-sm text-emerald-400">{formatDuration(durationSec)}</span>
						</div>
					</div>
				</div>

				{/* Local video PiP (only for video calls) */}
				{isVideoCall && hasLocalVideo && (
					<div className="absolute bottom-20 right-4 w-32 h-44 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-gray-800">
						<video
							ref={localVideoRef}
							autoPlay
							playsInline
							muted
							className="w-full h-full object-cover"
						/>
					</div>
				)}
			</div>

			{/* Control bar */}
			<div className="bg-gray-800/90 backdrop-blur-sm px-6 py-4 flex items-center justify-center gap-4">
				<button
					className={`p-4 rounded-full transition-all ${isMuted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-700 hover:bg-gray-600'
						} text-white`}
					onClick={onMicToggle}
					title={isMuted ? 'Bật micro' : 'Tắt micro'}
				>
					{isMuted ? <MicOff size={22} /> : <Mic size={22} />}
				</button>

				{isVideoCall && (
					<button
						className={`p-4 rounded-full transition-all ${!isVideoOn ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-700 hover:bg-gray-600'
							} text-white`}
						onClick={onVideoToggle}
						title={isVideoOn ? 'Tắt camera' : 'Bật camera'}
					>
						{isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
					</button>
				)}

				<button
					className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-110"
					onClick={onHangup}
					title="Kết thúc cuộc gọi"
				>
					<PhoneOff size={22} />
				</button>
			</div>
		</div>
	)
}
