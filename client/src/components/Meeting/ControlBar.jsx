import React, { useState, useEffect } from 'react';
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
  onToggleDrawer, // 'details' | 'people' | 'chat' | 'whiteboard'
  onOpenSettings,
  onLeaveCall
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global hotkeys (Ctrl+D for mic, Ctrl+E for camera)
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

  const reactionEmojis = ['\u2764\uFE0F', '\uD83D\uDC4D', '\uD83D\uDC4F', '\uD83C\uDF89', '\uD83D\uDE02', '\uD83D\uDE2E', '\uD83D\uDE22', '\uD83D\uDD25'];

  return (
    <footer className="h-20 bg-[#202124]/95 backdrop-blur-xl px-3 sm:px-4 md:px-6 flex items-center justify-between border-t border-white/[0.06] shrink-0 relative z-40 select-none shadow-[0_-12px_40px_rgba(0,0,0,0.22)]">
      {/* Left: Meeting Time & Code */}
      <div className="hidden md:flex items-center gap-3 text-sm text-[#e8eaed]">
        <span className="font-medium">{currentTime}</span>
        <span className="text-[#5f6368]">|</span>
        <span className="font-mono text-xs text-[#9aa0a6]">{roomId}</span>
      </div>

      {/* Center: Main Media Controls */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 mx-auto md:mx-0 max-w-full overflow-x-auto no-scrollbar px-1">
        {/* Microphone Toggle */}
        <div className="relative group">
          <button
            onClick={onToggleAudio}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              isAudioEnabled
                ? 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
                : 'bg-meet-red hover:bg-meet-redHover text-white'
            }`}
            title={`Turn ${isAudioEnabled ? 'off' : 'on'} microphone (Ctrl+D)`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Camera Toggle */}
        <div className="relative group">
          <button
            onClick={onToggleVideo}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              isVideoEnabled
                ? 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
                : 'bg-meet-red hover:bg-meet-redHover text-white'
            }`}
            title={`Turn ${isVideoEnabled ? 'off' : 'on'} camera (Ctrl+E)`}
          >
            {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Emoji Reactions Trigger & Popover */}
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              showReactions ? 'bg-meet-blue text-white' : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
            }`}
            title="Send a reaction"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showReactions && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowReactions(false)}
              />
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#28292c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSendReaction(emoji);
                      setShowReactions(false);
                    }}
                    className="w-9 h-9 rounded-full hover:bg-[#3c4043] text-xl flex items-center justify-center hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Screen Share Toggle */}
        <div className="relative group">
          <button
            onClick={onToggleScreenShare}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              isScreenSharing
                ? 'bg-meet-blue text-white'
                : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
            }`}
            title={isScreenSharing ? 'Stop presenting' : 'Present now'}
          >
            <MonitorUp className="w-5 h-5" />
          </button>
        </div>

        {/* Raise Hand Toggle */}
        <div className="relative group">
          <button
            onClick={onToggleRaiseHand}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              isHandRaised
                ? 'bg-[#fbbc04] text-[#202124]'
                : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
            }`}
            title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          >
            <Hand className="w-5 h-5" />
          </button>
        </div>

        {/* Collaborative Whiteboard */}
        <div className="relative group">
          <button
            onClick={() => onToggleDrawer('whiteboard')}
            className={`meet-control w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg ${
              activeDrawer === 'whiteboard'
                ? 'bg-meet-blue text-white'
                : 'bg-[#3c4043] hover:bg-[#4e5256] text-white'
            }`}
            title="Open Collaborative Whiteboard"
          >
            <PenTool className="w-5 h-5" />
          </button>
        </div>

        {/* More Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="meet-control w-11 h-11 rounded-full bg-[#3c4043] hover:bg-[#4e5256] text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMoreMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-52 bg-[#28292c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl py-2 shadow-2xl z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={toggleFullscreen}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#e8eaed] hover:bg-[#3c4043]"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span>{isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-[#e8eaed] hover:bg-[#3c4043]"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Leave Call (Google Red Pill) */}
        <div className="relative group ml-1">
          <button
            onClick={onLeaveCall}
            className="h-11 px-5 sm:px-6 rounded-full bg-meet-red hover:bg-meet-redHover text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_8px_24px_rgba(234,67,53,0.30)] transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            title="Leave call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right: Drawer Toggles */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Info / Details Drawer */}
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

        {/* People Drawer */}
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

        {/* Chat Drawer */}
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



