import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Hand, Pin, PinOff, MonitorUp } from 'lucide-react';
import { getAvatarColor, getInitials } from '../../utils/roomUtils';
import { useAudioMeter } from '../../hooks/useAudioMeter';

export const VideoTile = ({
  participant,
  isPinned,
  onTogglePin,
  isSingleParticipant
}) => {
  const videoRef = useRef(null);
  const { isSpeaking } = useAudioMeter(
    participant.stream,
    participant.audioEnabled
  );

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }

      videoRef.current.play().catch(() => {});
    }
  }, [participant.stream, participant.videoEnabled]);

  const displayName = participant.name || 'Participant';
  const avatarBg = getAvatarColor(displayName);
  const initials = getInitials(displayName);

  const hasVideoTrack =
    participant.stream &&
    participant.stream.getVideoTracks().length > 0;

  const isVideoActive =
    participant.videoEnabled && hasVideoTrack;

  return (
    <div
      className={`
        relative
        w-full
        h-full
        min-h-0
        overflow-hidden
        rounded-xl sm:rounded-2xl
        bg-[#28292c]
        border
        transition-all duration-200
        group
        flex
        items-center
        justify-center
        ${
          isSpeaking
            ? 'border-meet-blue ring-1 sm:ring-2 ring-meet-blue shadow-lg shadow-blue-500/20'
            : 'border-[#3c4043]/60 hover:border-[#5f6368]'
        }
      `}
    >
      {/* Video */}
      <video
        ref={(el) => {
          videoRef.current = el;

          if (
            el &&
            participant.stream &&
            el.srcObject !== participant.stream
          ) {
            el.srcObject = participant.stream;
            el.play().catch(() => {});
          }
        }}
        autoPlay
        playsInline
        muted={participant.isLocal}
        className={`
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-center
          ${
            participant.isLocal && !participant.isScreenSharing
              ? 'video-mirror'
              : ''
          }
          ${isVideoActive ? 'block' : 'hidden'}
        `}
      />

      {/* Avatar */}
      {!isVideoActive && (
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 select-none">
          <div
            className="
              w-16 h-16
              sm:w-24 sm:h-24
              md:w-28 md:h-28
              rounded-full
              flex items-center justify-center
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-medium
              text-white
              shadow-xl
            "
            style={{ backgroundColor: avatarBg }}
          >
            {initials}
          </div>
        </div>
      )}

      {/* Top Left: Hand */}
      {participant.isHandRaised && (
        <div
          className="
            absolute
            top-2 left-2
            sm:top-3 sm:left-3
            bg-[#fbbc04]
            text-[#202124]
            px-2 py-1
            rounded-full
            text-[10px] sm:text-xs
            font-semibold
            flex items-center gap-1
            shadow-lg
            animate-bounce
            z-10
          "
        >
          <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          <span className="hidden sm:inline">Raised hand</span>
        </div>
      )}

      {/* Top Right */}
      <div
        className="
          absolute
          top-2 right-2
          sm:top-3 sm:right-3
          flex items-center gap-1
          z-10
        "
      >
        {participant.isScreenSharing && (
          <div
            className="
              bg-[#202124]/80
              backdrop-blur-md
              text-meet-blue
              px-2 py-1
              rounded-md
              text-[10px] sm:text-xs
              font-medium
              flex items-center gap-1
              border border-white/10
            "
          >
            <MonitorUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Presenting</span>
          </div>
        )}

        <button
          onClick={onTogglePin}
          className={`
            p-1.5
            rounded-full
            bg-[#202124]/75
            hover:bg-[#3c4043]
            text-white
            transition-opacity
            ${
              isPinned
                ? 'opacity-100 bg-meet-blue'
                : 'opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100'
            }
          `}
          title={isPinned ? 'Unpin' : 'Pin to screen'}
        >
          {isPinned ? (
            <PinOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      </div>

      {/* Bottom Name + Mic */}
      <div
        className="
          absolute
          bottom-2 left-2
          sm:bottom-3 sm:left-3
          max-w-[80%]
          flex items-center gap-1.5
          bg-[#202124]/80
          backdrop-blur-md
          px-2.5 py-1.5
          sm:px-3 sm:py-1.5
          rounded-lg
          border border-white/10
          text-[11px] sm:text-xs
          text-white
          z-10
        "
      >
        <span className="truncate font-medium">
          {displayName}
          {participant.isLocal && ' (You)'}
        </span>

        <div className="shrink-0 flex items-center">
          {participant.audioEnabled ? (
            isSpeaking ? (
              <div className="w-3 h-3 flex items-end gap-[1.5px]">
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
