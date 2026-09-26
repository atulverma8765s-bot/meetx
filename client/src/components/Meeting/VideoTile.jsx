import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Hand, Pin, PinOff, MonitorUp } from 'lucide-react';
import { getAvatarColor, getInitials } from '../../utils/roomUtils';
import { useAudioMeter } from '../../hooks/useAudioMeter';

export const VideoTile = ({
  participant, // { socketId, name, stream, audioEnabled, videoEnabled, isScreenSharing, isHandRaised, isLocal }
  isPinned,
  onTogglePin,
  isSingleParticipant
}) => {
  const videoRef = useRef(null);
  const { isSpeaking } = useAudioMeter(participant.stream, participant.audioEnabled);

  // Keep srcObject synchronized and trigger play
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
      videoRef.current.play().catch((err) => console.debug('Video playback notice:', err));
    }
  }, [participant.stream, participant.videoEnabled]);

  const displayName = participant.name || 'Participant';
  const avatarBg = getAvatarColor(displayName);
  const initials = getInitials(displayName);
  const hasVideoTrack = participant.stream && participant.stream.getVideoTracks().length > 0;
  const isVideoActive = participant.videoEnabled && hasVideoTrack;

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-[#28292c] border transition-all duration-200 group flex items-center justify-center ${
        isSpeaking
          ? 'border-meet-blue ring-2 ring-meet-blue shadow-lg shadow-blue-500/20'
          : 'border-[#3c4043]/60 hover:border-[#5f6368]'
      }`}
    >
      {/* Video Element is ALWAYS kept mounted to prevent WebRTC track binding delays */}
      <video
        ref={(el) => {
          videoRef.current = el;
          if (el && participant.stream && el.srcObject !== participant.stream) {
            el.srcObject = participant.stream;
            el.play().catch(() => {});
          }
        }}
        autoPlay
        playsInline
        muted={participant.isLocal} // Always mute local video playback to avoid feedback loop
        className={`w-full h-full object-cover ${
          participant.isLocal && !participant.isScreenSharing ? 'video-mirror' : ''
        } ${isVideoActive ? 'block' : 'hidden'}`}
      />

      {/* Avatar Fallback shown when video is inactive */}
      {!isVideoActive && (
        <div className="flex flex-col items-center justify-center gap-3 select-none">
          <div
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-medium text-white shadow-xl transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: avatarBg }}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Top Left: Hand Raised Badge */}
      {participant.isHandRaised && (
        <div className="absolute top-3 left-3 bg-[#fbbc04] text-[#202124] px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg animate-bounce z-10">
          <Hand className="w-3.5 h-3.5 fill-current" />
          <span>Raised hand</span>
        </div>
      )}

      {/* Top Right: Pin / Screen Share Indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {participant.isScreenSharing && (
          <div className="bg-[#202124]/80 backdrop-blur-md text-meet-blue px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 border border-white/10">
            <MonitorUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Presenting</span>
          </div>
        )}

        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-full bg-[#202124]/70 hover:bg-[#3c4043] text-white transition-opacity ${
            isPinned ? 'opacity-100 bg-meet-blue' : 'opacity-0 group-hover:opacity-100'
          }`}
          title={isPinned ? 'Unpin' : 'Pin to screen'}
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Name & Mic Badge */}
      <div className="absolute bottom-3 left-3 max-w-[85%] flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white z-10">
        <span className="truncate font-medium">
          {displayName} {participant.isLocal && '(You)'}
        </span>

        {/* Mic status icon */}
        <div className="shrink-0 flex items-center">
          {participant.audioEnabled ? (
            isSpeaking ? (
              <div className="w-3.5 h-3.5 flex items-end gap-[1.5px]">
                <div className="w-[2px] h-full bg-meet-green animate-pulse rounded-full" />
                <div className="w-[2px] h-2/3 bg-meet-green animate-pulse rounded-full" />
                <div className="w-[2px] h-3/4 bg-meet-green animate-pulse rounded-full" />
              </div>
            ) : (
              <Mic className="w-3.5 h-3.5 text-white/80" />
            )
          ) : (
            <div className="w-4 h-4 rounded-full bg-meet-red flex items-center justify-center">
              <MicOff className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
