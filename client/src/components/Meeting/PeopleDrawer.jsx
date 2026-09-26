import React, { useState } from 'react';
import { X, Search, Mic, MicOff, Video, VideoOff, Hand, VolumeX, Shield } from 'lucide-react';
import { getAvatarColor, getInitials } from '../../utils/roomUtils';

export const PeopleDrawer = ({
  isOpen,
  onClose,
  allParticipants,
  currentUser,
  onForceMuteUser
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = allParticipants.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="w-80 md:w-96 h-full bg-[#28292c] border-l border-[#3c4043] flex flex-col z-30 shrink-0 select-text">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#3c4043]">
        <h3 className="text-base font-medium text-white flex items-center gap-2">
          <span>People</span>
          <span className="text-xs bg-[#3c4043] text-[#bdc1c6] px-2 py-0.5 rounded-full">
            {allParticipants.length}
          </span>
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[#3c4043]/50">
        <div className="flex items-center gap-2.5 bg-[#202124] border border-[#5f6368] rounded-lg px-3 py-2 text-xs">
          <Search className="w-4 h-4 text-[#9aa0a6]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for people"
            className="flex-1 bg-transparent text-[#e8eaed] placeholder-[#9aa0a6] outline-none"
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filtered.map((p) => {
          const avatarBg = getAvatarColor(p.name);
          const initials = getInitials(p.name);

          return (
            <div
              key={p.socketId}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#3c4043]/50 transition-colors"
            >
              {/* Left: Avatar & Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow"
                  style={{ backgroundColor: avatarBg }}
                >
                  {initials}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-normal text-white truncate">
                      {p.name}
                    </span>
                    {p.isLocal && (
                      <span className="text-[11px] text-[#9aa0a6] shrink-0">(You)</span>
                    )}
                  </div>
                  {p.isHost && (
                    <div className="flex items-center gap-1 text-[10px] text-meet-blue font-medium">
                      <Shield className="w-3 h-3" />
                      <span>Meeting host</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Status Icons & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {p.isHandRaised && (
                  <Hand className="w-4 h-4 text-[#fbbc04] animate-bounce" title="Hand raised" />
                )}

                {/* Video Icon */}
                {p.videoEnabled ? (
                  <Video className="w-4 h-4 text-[#bdc1c6]" title="Camera on" />
                ) : (
                  <VideoOff className="w-4 h-4 text-meet-red" title="Camera off" />
                )}

                {/* Audio Icon */}
                {p.audioEnabled ? (
                  <Mic className="w-4 h-4 text-[#bdc1c6]" title="Microphone on" />
                ) : (
                  <MicOff className="w-4 h-4 text-meet-red" title="Microphone off" />
                )}

                {/* Host mute button for remote participant */}
                {currentUser?.isHost && !p.isLocal && p.audioEnabled && (
                  <button
                    onClick={() => onForceMuteUser(p.socketId)}
                    className="p-1 rounded-md hover:bg-meet-red/20 text-[#9aa0a6] hover:text-meet-red transition-colors ml-1"
                    title={`Mute ${p.name}`}
                  >
                    <VolumeX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
