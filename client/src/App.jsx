import React, { useState, useEffect } from 'react';
import { HomePage } from './components/Home/HomePage';
import { LobbyPage } from './components/Lobby/LobbyPage';
import { MeetingRoom } from './components/Meeting/MeetingRoom';
import { sanitizeMeetingCode } from './utils/roomUtils';
import { ArrowLeft, RefreshCw, Star, Check } from 'lucide-react';

export function App() {
  const [currentMode, setCurrentMode] = useState('home'); // 'home' | 'lobby' | 'meeting' | 'post-call'
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [meetingUser, setMeetingUser] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Check URL query on mount (e.g. ?room=abc-defg-hij)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const sanitized = sanitizeMeetingCode(roomParam);
      if (sanitized) {
        setCurrentRoomId(sanitized);
        setCurrentMode('lobby');
      }
    }
  }, []);

  const handleStartInstantMeeting = (roomId) => {
    setCurrentRoomId(roomId);
    window.history.pushState({}, '', `/?room=${roomId}`);
    setCurrentMode('lobby');
  };

  const handleJoinByCode = (roomId) => {
    setCurrentRoomId(roomId);
    window.history.pushState({}, '', `/?room=${roomId}`);
    setCurrentMode('lobby');
  };

  const handleJoinCall = ({ name, audioEnabled, videoEnabled, stream, presentMode }) => {
    setMeetingUser({
      name,
      audioEnabled,
      videoEnabled,
      isHost: false,
      presentMode
    });
    setMediaStream(stream);
    setCurrentMode('meeting');
  };

  const handleLeaveCall = () => {
    setCurrentMode('post-call');
  };

  const handleRejoin = () => {
    setCurrentMode('lobby');
  };

  const handleBackHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentRoomId('');
    setMeetingUser(null);
    setMediaStream(null);
    setFeedbackRating(0);
    setFeedbackSubmitted(false);
    setCurrentMode('home');
  };

  // 1. In Meeting Room
  if (currentMode === 'meeting') {
    return (
      <MeetingRoom
        roomId={currentRoomId}
        initialUser={meetingUser}
        initialStream={mediaStream}
        onLeaveMeeting={handleLeaveCall}
      />
    );
  }

  // 2. Pre-Join Lobby Green Room
  if (currentMode === 'lobby') {
    return (
      <LobbyPage
        roomId={currentRoomId}
        onJoinCall={handleJoinCall}
        onBackHome={handleBackHome}
      />
    );
  }

  // 3. Post-Call Screen
  if (currentMode === 'post-call') {
    return (
      <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col justify-between selection:bg-meet-blue selection:text-white">
        <header className="px-6 py-4">
          <span className="text-xl font-medium tracking-tight text-white font-sans">
            Meet<span className="text-meet-blue font-bold">X</span>
          </span>
        </header>

        <main className="flex-1 max-w-lg mx-auto w-full px-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-normal text-white mb-2">You left the meeting</h2>
          <p className="text-sm text-[#9aa0a6] mb-8 font-mono">Room: {currentRoomId}</p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full mb-10">
            <button
              onClick={handleRejoin}
              className="w-full sm:flex-1 py-3 px-6 rounded-full border border-[#5f6368] hover:bg-[#3c4043] text-meet-blue hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rejoin</span>
            </button>

            <button
              onClick={handleBackHome}
              className="w-full sm:flex-1 py-3 px-6 rounded-full bg-meet-blue hover:bg-meet-blueHover text-white text-sm font-medium shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to home screen</span>
            </button>
          </div>

          {/* Feedback Rating Box */}
          <div className="p-6 rounded-2xl bg-[#28292c] border border-[#3c4043] w-full shadow-xl">
            <h4 className="text-sm font-medium text-white mb-2">How was the audio and video quality?</h4>
            {feedbackSubmitted ? (
              <div className="flex items-center justify-center gap-2 text-meet-green text-sm py-2">
                <Check className="w-4 h-4" />
                <span>Thanks for your feedback!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setFeedbackRating(star);
                      setFeedbackSubmitted(true);
                    }}
                    className={`p-1.5 transition-transform hover:scale-125 ${
                      star <= feedbackRating ? 'text-[#fbbc04]' : 'text-[#5f6368] hover:text-[#fbbc04]'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="px-6 py-4 text-center text-xs text-[#9aa0a6]">
          <span>MeetX • Video conferencing</span>
        </footer>
      </div>
    );
  }

  // 4. Default: Landing Home Page
  return (
    <HomePage
      onStartMeeting={handleStartInstantMeeting}
      onJoinMeeting={handleJoinByCode}
    />
  );
}
