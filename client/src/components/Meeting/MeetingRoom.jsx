import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { VideoGrid } from './VideoGrid';
import { ControlBar } from './ControlBar';
import { ChatDrawer } from './ChatDrawer';
import { PeopleDrawer } from './PeopleDrawer';
import { DetailsDrawer } from './DetailsDrawer';
import { WhiteboardDrawer } from './WhiteboardDrawer';
import { SettingsModal } from './SettingsModal';
import { playChatSound } from '../../utils/soundEffects';

export const MeetingRoom = ({
  roomId,
  initialUser,
  initialStream,
  onLeaveMeeting
}) => {
  const [activeDrawer, setActiveDrawer] = useState(null); // null | 'details' | 'people' | 'chat' | 'whiteboard'
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastChatMessageId, setLastChatMessageId] = useState(null);

  const {
    localStream,
    screenStream,
    isScreenSharing,
    participants,
    currentUser,
    chatMessages,
    reactions,
    whiteboardHistory,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRaiseHand,
    sendChatMessage,
    sendReaction,
    emitDraw,
    clearWhiteboard,
    forceMuteUser,
    leaveCall
  } = useWebRTC(roomId, initialUser, initialStream);

  // Track unread messages if chat drawer is closed
  useEffect(() => {
    if (chatMessages.length > 0) {
      const latest = chatMessages[chatMessages.length - 1];
      if (latest.id !== lastChatMessageId) {
        setLastChatMessageId(latest.id);
        if (latest.senderId !== currentUser.socketId) {
          playChatSound();
          if (activeDrawer !== 'chat') {
            setUnreadChatCount((prev) => prev + 1);
          }
        }
      }
    }
  }, [chatMessages, activeDrawer, currentUser.socketId, lastChatMessageId]);

  const handleToggleDrawer = (drawerName) => {
    setActiveDrawer((prev) => {
      const next = prev === drawerName ? null : drawerName;
      if (next === 'chat') {
        setUnreadChatCount(0);
      }
      return next;
    });
  };

  const handleExitCall = () => {
    leaveCall();
    onLeaveMeeting();
  };

  // Compile full participants list (Local + Remote)
  const localParticipant = {
    socketId: currentUser.socketId || 'local-user',
    name: currentUser.name || 'You',
    stream: isScreenSharing && screenStream ? screenStream : localStream,
    audioEnabled: currentUser.audioEnabled,
    videoEnabled: currentUser.videoEnabled,
    isScreenSharing,
    isHandRaised: currentUser.isHandRaised,
    isHost: currentUser.isHost,
    isLocal: true
  };

  const allParticipants = [localParticipant, ...participants];

  return (
    <div className="h-screen w-screen bg-[#202124] text-[#e8eaed] flex flex-col overflow-hidden relative selection:bg-meet-blue selection:text-white">
      {/* Main Video Grid and Side Drawers Area */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative h-[calc(100vh-72px)] sm:h-auto pb-0">
        {/* Main Stage Video Grid */}
        <div className="flex-1 min-h-0 h-full min-w-0 relative overflow-hidden">
          <VideoGrid allParticipants={allParticipants} />

          {/* Floating Emoji Reactions Layer */}
          <div className="reaction-container">
            {reactions.map((r) => (
              <div
                key={r.id}
                className="animate-float-up flex items-center gap-2 bg-[#202124]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-2xl"
              >
                <span className="text-2xl">{r.emoji}</span>
                {r.senderName && (
                  <span className="text-xs font-medium text-white truncate max-w-[120px]">
                    {r.senderName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sliding Side Drawers */}
        <DetailsDrawer
          isOpen={activeDrawer === 'details'}
          onClose={() => setActiveDrawer(null)}
          roomId={roomId}
        />

        <PeopleDrawer
          isOpen={activeDrawer === 'people'}
          onClose={() => setActiveDrawer(null)}
          allParticipants={allParticipants}
          currentUser={currentUser}
          onForceMuteUser={forceMuteUser}
        />

        <ChatDrawer
          isOpen={activeDrawer === 'chat'}
          onClose={() => setActiveDrawer(null)}
          messages={chatMessages}
          onSendMessage={sendChatMessage}
          currentSocketId={currentUser.socketId}
        />

        <WhiteboardDrawer
          isOpen={activeDrawer === 'whiteboard'}
          onClose={() => setActiveDrawer(null)}
          history={whiteboardHistory}
          onDraw={emitDraw}
          onClear={clearWhiteboard}
        />
      </div>

      {/* Google Meet Bottom Controls Pill Bar */}
      <ControlBar
        roomId={roomId}
        currentUser={currentUser}
        isAudioEnabled={currentUser.audioEnabled}
        isVideoEnabled={currentUser.videoEnabled}
        isScreenSharing={isScreenSharing}
        isHandRaised={currentUser.isHandRaised}
        participantCount={allParticipants.length}
        unreadChatCount={unreadChatCount}
        activeDrawer={activeDrawer}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onToggleRaiseHand={toggleRaiseHand}
        onSendReaction={sendReaction}
        onToggleDrawer={handleToggleDrawer}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLeaveCall={handleExitCall}
      />

      {/* Audio/Video Device Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
