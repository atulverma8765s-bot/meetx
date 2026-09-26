import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Keyboard, 
  Plus, 
  Link as LinkIcon, 
  Calendar, 
  Clock, 
  Copy, 
  Check, 
  HelpCircle, 
  Settings, 
  MessageSquare, 
  ShieldCheck, 
  Users, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { generateMeetingCode, sanitizeMeetingCode } from '../../utils/roomUtils';

export const HomePage = ({ onStartMeeting, onJoinMeeting }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [meetingCodeInput, setMeetingCodeInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [laterModalCode, setLaterModalCode] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Live time and date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateInstant = () => {
    setIsDropdownOpen(false);
    const code = generateMeetingCode();
    onStartMeeting(code);
  };

  const handleCreateLater = () => {
    setIsDropdownOpen(false);
    const code = generateMeetingCode();
    setLaterModalCode(code);
  };

  const handleCopyLaterLink = () => {
    const url = `${window.location.origin}/?room=${laterModalCode}`;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const sanitized = sanitizeMeetingCode(meetingCodeInput);
    if (sanitized) {
      onJoinMeeting(sanitized);
    }
  };

  const carouselItems = [
    {
      title: "Get a link you can share",
      description: "Click New meeting to get a link you can send to people you want to meet with",
      icon: LinkIcon,
      color: "from-blue-600 to-indigo-700",
      accent: "bg-blue-500"
    },
    {
      title: "Crystal-clear HD video & audio",
      description: "Connect securely with ultra-low latency WebRTC peer-to-peer streaming",
      icon: Users,
      color: "from-emerald-600 to-teal-700",
      accent: "bg-emerald-500"
    },
    {
      title: "Real-time whiteboard & reactions",
      description: "Brainstorm live on an interactive canvas and share floating emoji reactions",
      icon: Sparkles,
      color: "from-amber-600 to-rose-700",
      accent: "bg-amber-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col justify-between selection:bg-meet-blue selection:text-white">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#3c4043]/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-500 to-yellow-500 p-[2px] shadow-lg shadow-blue-500/10">
              <div className="w-full h-full bg-[#202124] rounded-[10px] flex items-center justify-center">
                <Video className="w-5 h-5 text-meet-blue" />
              </div>
            </div>
            <span className="text-2xl font-medium tracking-tight text-white flex items-center gap-1.5 font-sans">
              Meet<span className="text-meet-blue font-bold">X</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm text-[#9aa0a6]">
          <div className="hidden sm:flex items-center gap-2 font-normal text-base text-[#e8eaed]">
            <span>{currentTime}</span>
            <span>•</span>
            <span>{currentDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="p-2.5 rounded-full hover:bg-[#3c4043]/60 text-[#bdc1c6] transition-colors"
              title="Help and Feedback"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 rounded-full hover:bg-[#3c4043]/60 text-[#bdc1c6] transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white text-sm font-medium shadow-md ml-1 ring-2 ring-white/10">
              MX
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Actions */}
        <div className="flex-1 max-w-xl text-left">
          <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-white mb-5 leading-[1.18]">
            Video calls and meetings for everyone
          </h1>
          <p className="text-lg text-[#9aa0a6] mb-8 font-light leading-relaxed">
            Connect, collaborate, and celebrate from anywhere with MeetX. Free, instant, and secure real-time video conferencing.
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 relative">
            {/* New Meeting Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-auto px-6 py-3.5 bg-meet-blue hover:bg-meet-blueHover active:bg-[#1557b0] text-white font-medium rounded-full flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/20 transition-all text-[15px]"
              >
                <Video className="w-5 h-5" />
                <span>New meeting</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-2 w-72 bg-[#28292c] border border-[#3c4043] rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={handleCreateLater}
                      className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-[#3c4043]/70 text-left text-sm text-[#e8eaed] transition-colors"
                    >
                      <LinkIcon className="w-4 h-4 text-meet-blue" />
                      <span>Create a meeting for later</span>
                    </button>
                    <button
                      onClick={handleCreateInstant}
                      className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-[#3c4043]/70 text-left text-sm text-[#e8eaed] transition-colors"
                    >
                      <Plus className="w-4 h-4 text-meet-green" />
                      <span>Start an instant meeting</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleCreateInstant();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3.5 hover:bg-[#3c4043]/70 text-left text-sm text-[#e8eaed] transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-meet-yellow" />
                      <span>Schedule in calendar</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Enter Code Input */}
            <form onSubmit={handleJoinByCode} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9aa0a6]">
                  <Keyboard className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={meetingCodeInput}
                  onChange={(e) => setMeetingCodeInput(e.target.value)}
                  placeholder="Enter a code or link"
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent border border-[#5f6368] hover:border-[#bdc1c6] focus:border-meet-blue focus:ring-1 focus:ring-meet-blue rounded-full text-sm text-[#e8eaed] placeholder-[#9aa0a6] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!sanitizeMeetingCode(meetingCodeInput)}
                className="px-5 py-3.5 text-meet-blue hover:text-white hover:bg-meet-blue/20 disabled:text-[#5f6368] disabled:hover:bg-transparent font-medium rounded-full text-sm transition-all"
              >
                Join
              </button>
            </form>
          </div>

          {/* Divider and Info */}
          <div className="pt-6 border-t border-[#3c4043]/50 flex items-center gap-2 text-sm text-[#9aa0a6]">
            <ShieldCheck className="w-4 h-4 text-meet-green shrink-0" />
            <span>
              End-to-end encrypted direct peer connections.{' '}
              <a href="#learn-more" onClick={(e) => e.preventDefault()} className="text-meet-blue hover:underline">
                Learn more
              </a>
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Visual Showcase */}
        <div className="flex-1 max-w-lg w-full flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#28292c] to-[#1e1f21] border border-[#3c4043]/60 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl group">
            {/* Visual Accent Circle */}
            <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${carouselItems[carouselIndex].color} flex items-center justify-center mb-6 shadow-xl transition-all duration-500 scale-100 group-hover:scale-105`}>
              {React.createElement(carouselItems[carouselIndex].icon, { className: "w-12 h-12 text-white" })}
            </div>

            <h3 className="text-xl font-medium text-white mb-2 transition-all">
              {carouselItems[carouselIndex].title}
            </h3>
            <p className="text-sm text-[#9aa0a6] max-w-xs transition-all">
              {carouselItems[carouselIndex].description}
            </p>

            {/* Carousel navigation arrows */}
            <button
              onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#3c4043]/50 hover:bg-[#3c4043] text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCarouselIndex((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-[#3c4043]/50 hover:bg-[#3c4043] text-white opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 mt-5">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  carouselIndex === idx ? 'w-6 bg-meet-blue' : 'bg-[#5f6368]'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-[#9aa0a6] border-t border-[#3c4043]/20">
        <span>MeetX • Modern WebRTC Video Conferencing inspired by Google Meet</span>
      </footer>

      {/* Meeting For Later Modal */}
      {laterModalCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-[#28292c] border border-[#3c4043] rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setLaterModalCode(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-normal text-white mb-2">Here's your joining info</h3>
            <p className="text-sm text-[#9aa0a6] mb-5">
              Send this link to people you want to meet with. Be sure to save it so you can use it later, too.
            </p>

            <div className="flex items-center gap-2 bg-[#202124] border border-[#3c4043] rounded-lg p-3 mb-5">
              <span className="text-sm text-[#e8eaed] truncate flex-1 font-mono select-all">
                {window.location.origin}/?room={laterModalCode}
              </span>
              <button
                onClick={handleCopyLaterLink}
                className="p-2 rounded-md hover:bg-[#3c4043] text-meet-blue transition-colors shrink-0"
                title="Copy link"
              >
                {hasCopied ? <Check className="w-5 h-5 text-meet-green" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLaterModalCode(null)}
                className="px-4 py-2 text-sm text-[#bdc1c6] hover:bg-[#3c4043] rounded-md transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const code = laterModalCode;
                  setLaterModalCode(null);
                  onJoinMeeting(code);
                }}
                className="px-5 py-2 text-sm bg-meet-blue hover:bg-meet-blueHover text-white font-medium rounded-md transition-colors"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
