import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Hand,
  Smile,
  PhoneOff,
  Info,
  Users,
  MessageSquare,
  PenTool,
  MoreVertical,
  Maximize2,
  Minimize2,
  Settings as SettingsIcon
} from 'lucide-react';

export const ControlBar = ({
  roomId,
  currentUser,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isHandRaised,
  participantCount,
  unreadChatCount,
  activeDrawer,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRaiseHand,
  onSendReaction,
  onToggleDrawer,
  onOpenSettings,
  onLeaveCall
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onToggleAudio();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        onToggleVideo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleAudio, onToggleVideo]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }

    setShowMoreMenu(false);
  };

  const reactionEmojis = [
    '\u{1F44D}',
    '\u{2764}\u{FE0F}',
    '\u{1F602}',
    '\u{1F389}',
    '\u{1F525}',
    '\u{1F62E}',
    '\u{1F44F}',
    '\u{1F60D}'
  ];

  const controlClass = (active = false, danger = false) =>
    `meet-control w-[38px] h-[38px] sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0 ${
      danger
        ? 'bg-meet-red hover:bg-meet-redHover text-white'
        : active
          ? 'bg-meet-blue text-white'
          : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
    }`;

  return (
    <footer
className="
  h-[72px]
  sm:h-20
  w-full
  shrink-0
  bg-[#202124]/95
  backdrop-blur-xl
  border-t border-white/[0.06]
  flex items-center justify-between
  overflow-x-auto
  no-scrollbar
  px-1 sm:px-4 md:px-6
  z-[100]
  fixed sm:relative
  bottom-0
  left-0
  right-0
  select-none
  overflow-visible
  shadow-[0_-12px_40px_rgba(0,0,0,0.35)]
  box-border
  pb-[env(safe-area-inset-bottom)]
"
    >
      {/* Left: Meeting Time & Code */}
      <div className="hidden md:flex items-center gap-3 text-sm text-[#e8eaed]">
        <span className="font-medium">{currentTime}</span>
        <span className="text-[#5f6368]">|</span>
        <span className="font-mono text-xs text-[#9aa0a6]">
          {roomId}
        </span>
      </div>

      {/* Center Controls */}
      <div
        className="
  flex
  items-center
  justify-center
  gap-1
  sm:gap-3
  mx-auto
  w-max
  flex-none
  min-w-0
  h-full
  sm:flex-1
  overflow-visible
  overflow-y-visible
  no-scrollbar
  px-1
"
      >
        {/* Microphone */}
        <button
          onClick={onToggleAudio}
          className={controlClass(false, !isAudioEnabled)}
          title={`Turn ${isAudioEnabled ? 'off' : 'on'} microphone`}
        >
          {isAudioEnabled ? (
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Camera */}
        <button
          onClick={onToggleVideo}
          className={controlClass(false, !isVideoEnabled)}
          title={`Turn ${isVideoEnabled ? 'off' : 'on'} camera`}
        >
          {isVideoEnabled ? (
            <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        {/* Reactions */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowReactions((value) => !value);
              setShowMoreMenu(false);
            }}
            className={controlClass(showReactions)}
            title="Send a reaction"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showReactions && createPortal((
            <>
              <div
                className="fixed inset-0 z-[110]"
                onClick={() => setShowReactions(false)}
              />

              <div
                className="
                  fixed
                  left-1/2
                  -translate-x-1/2
                  bottom-[82px]
                  sm:bottom-24
                  z-[9999]
                  bg-[#28292c]/98
                  backdrop-blur-xl
                  border border-white/[0.10]
                  rounded-2xl
                  px-2 sm:px-3
                  py-2
                  flex items-center
                  gap-1
                  shadow-2xl
                  animate-in fade-in zoom-in-95
                "
              >
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="
                      w-9 h-9
                      sm:w-10 sm:h-10
                      rounded-full
                      hover:bg-[#3c4043]
                      text-xl
                      flex items-center justify-center
                      hover:scale-125
                      active:scale-110
                      transition-transform
                    "
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>), document.body)}
        </div>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          className={controlClass(isScreenSharing)}
          title={isScreenSharing ? 'Stop presenting' : 'Present now'}
        >
          <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Raise Hand */}
        <button
          onClick={onToggleRaiseHand}
          className={`
            meet-control
            w-[38px] h-[38px]
            sm:w-11 sm:h-11
            rounded-full
            flex items-center justify-center
            transition-all duration-200
            shadow-md hover:shadow-lg
            flex-shrink-0
            ${
              isHandRaised
                ? 'bg-[#fbbc04] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
            }
          `}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
        >
          <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Whiteboard */}
        <button
          onClick={() => onToggleDrawer('whiteboard')}
          className={controlClass(activeDrawer === 'whiteboard')}
          title="Open Collaborative Whiteboard"
        >
          <PenTool className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* More */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowMoreMenu((value) => !value);
              setShowReactions(false);
            }}
            className={controlClass(showMoreMenu)}
            title="More options"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showMoreMenu && createPortal((
            <>
              <div
                className="fixed inset-0 z-[110]"
                onClick={() => setShowMoreMenu(false)}
              />

              <div
                className="
                  fixed
                  left-1/2
                  -translate-x-1/2
                  bottom-[82px]
                  sm:bottom-24
                  z-[9999]
                  w-52
                  bg-[#28292c]/98
                  backdrop-blur-xl
                  border border-white/[0.10]
                  rounded-2xl
                  py-2
                  shadow-2xl
                  animate-in fade-in zoom-in-95
                "
              >
                <button
                  onClick={toggleFullscreen}
                  className="
                    w-full
                    px-4 py-3
                    flex items-center gap-3
                    text-sm text-[#e8eaed]
                    hover:bg-[#3c4043]
                    active:bg-[#4e5256]
                  "
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}

                  <span>
                    {isFullscreen ? 'Exit full screen' : 'Full screen'}
                  </span>
                </button>

                <button
                  type="button"
            onClick={() => {
              setShowMoreMenu(false);
                    onOpenSettings();
                  }}
                  className="
                    w-full
                    px-4 py-3
                    flex items-center gap-3
                    text-sm text-[#e8eaed]
                    hover:bg-[#3c4043]
                    active:bg-[#4e5256]
                  "
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </>), document.body)}
        </div>

        {/* Leave Call */}
        <button
          onClick={onLeaveCall}
          className="
            h-[38px]
            sm:h-11
            w-[44px]
            sm:w-auto
            sm:px-6
            rounded-full
            bg-meet-red
            hover:bg-meet-redHover
            text-white
            flex items-center justify-center
            gap-2
            shadow-lg
            transition-all duration-200
            flex-shrink-0
            sticky right-0
            z-10
          "
          title="Leave call"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Right: Drawer Toggles */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onToggleDrawer('details')}
          className={`p-2.5 rounded-full transition-colors ${
            activeDrawer === 'details'
              ? 'text-meet-blue bg-meet-blue/20'
              : 'text-[#bdc1c6] hover:bg-[#3c4043]'
          }`}
          title="Meeting details"
        >
          <Info className="w-5 h-5" />
        </button>

        <button
          onClick={() => onToggleDrawer('people')}
          className={`p-2.5 rounded-full relative transition-colors ${
            activeDrawer === 'people'
              ? 'text-meet-blue bg-meet-blue/20'
              : 'text-[#bdc1c6] hover:bg-[#3c4043]'
          }`}
          title="Show everyone"
        >
          <Users className="w-5 h-5" />

          {participantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#3c4043] text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border border-[#202124]">
              {participantCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onToggleDrawer('chat')}
          className={`p-2.5 rounded-full relative transition-colors ${
            activeDrawer === 'chat'
              ? 'text-meet-blue bg-meet-blue/20'
              : 'text-[#bdc1c6] hover:bg-[#3c4043]'
          }`}
          title="Chat with everyone"
        >
          <MessageSquare className="w-5 h-5" />

          {unreadChatCount > 0 && activeDrawer !== 'chat' && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-meet-blue rounded-full ring-2 ring-[#202124]" />
          )}
        </button>
      </div>
    </footer>
  );
};
















