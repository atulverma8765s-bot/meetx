import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Settings, 
  Copy, 
  Check, 
  ArrowLeft,
  Volume2,
  MonitorUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getAvatarColor, getInitials } from '../../utils/roomUtils';
import { useAudioMeter } from '../../hooks/useAudioMeter';

export const LobbyPage = ({ roomId, onJoinCall, onBackHome }) => {
  const [name, setName] = useState(localStorage.getItem('meetx_user_name') || '');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  const videoRef = useRef(null);
  const hasJoinedRef = useRef(false);
  const { isSpeaking, volume } = useAudioMeter(mediaStream, isAudioEnabled);

  // Helper to start camera and microphone with progressive fallbacks
  const startPreview = async () => {
    setIsCameraLoading(true);
    setPermissionError(null);

    // 1. Check if mediaDevices API is supported (requires localhost or HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError(
        'Camera/Mic access is blocked by the browser on plain HTTP network IP. Please open http://localhost:5000 on your computer.'
      );
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      setIsCameraLoading(false);
      return;
    }

    let stream = null;

    // Attempt 1: Ideal 720p HD Video + Audio
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      });
    } catch (e1) {
      console.warn('Ideal video constraints failed, trying basic video + audio...', e1);
      // Attempt 2: Basic Video + Audio
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
      } catch (e2) {
        console.warn('Basic video + audio failed, trying video only...', e2);
        // Attempt 3: Video only
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setIsAudioEnabled(false);
        } catch (e3) {
          console.warn('Video failed, trying audio only...', e3);
          // Attempt 4: Audio only
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsVideoEnabled(false);
            setPermissionError('Camera could not be accessed (may be in use by another app). Joined with audio only.');
          } catch (e4) {
            console.error('All media access failed:', e4);
            setPermissionError(
              'Camera and microphone permissions were denied or no device was found. Please allow camera permissions in your browser address bar.'
            );
            setIsVideoEnabled(false);
            setIsAudioEnabled(false);
          }
        }
      }
    }

    if (stream) {
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }
    setIsCameraLoading(false);
  };

  useEffect(() => {
    startPreview();

    return () => {
      // CRITICAL: Only stop preview tracks if the user is LEAVING, NOT if joining the meeting!
      if (!hasJoinedRef.current && mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure video element always binds srcObject whenever mediaStream or element mounts
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
      }
      videoRef.current.play().catch((err) => console.debug('Video preview play:', err));
    }
  }, [mediaStream]);

  // Sync video track state with isVideoEnabled
  useEffect(() => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoEnabled;
      }
    }
  }, [isVideoEnabled, mediaStream]);

  // Sync audio track state with isAudioEnabled
  useEffect(() => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isAudioEnabled;
      }
    }
  }, [isAudioEnabled, mediaStream]);

  const toggleMic = () => {
    setIsAudioEnabled((prev) => !prev);
  };

  const toggleCam = () => {
    setIsVideoEnabled((prev) => !prev);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleJoin = (presentMode = false) => {
    hasJoinedRef.current = true; // Mark as joined so unmount cleanup does NOT kill the stream!
    const finalName = name.trim() || 'Guest';
    localStorage.setItem('meetx_user_name', finalName);

    onJoinCall({
      name: finalName,
      audioEnabled: isAudioEnabled,
      videoEnabled: isVideoEnabled,
      stream: mediaStream,
      presentMode
    });
  };

  const displayName = name.trim() || 'Guest';
  const avatarBg = getAvatarColor(displayName);
  const initials = getInitials(displayName);

  return (
    <div className="min-h-screen bg-[#202124] text-[#e8eaed] flex flex-col justify-between selection:bg-meet-blue selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBackHome}
          className="flex items-center gap-2 text-sm text-[#9aa0a6] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3c4043]/50 hover:bg-[#3c4043] text-xs text-[#bdc1c6] transition-colors"
            title="Copy meeting link"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-meet-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono">{roomId}</span>
          </button>
        </div>
      </header>

      {/* Main Pre-join Green Room */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 flex flex-col lg:flex-row items-center justify-center gap-10">
        {/* Left Side: Camera/Mic Preview Box */}
        <div className="w-full lg:max-w-2xl flex flex-col items-center">
          <div className="w-full aspect-video bg-[#1e1f21] rounded-2xl relative overflow-hidden border border-[#3c4043] shadow-2xl flex items-center justify-center">
            {/* Video element is ALWAYS mounted to preserve WebRTC stream pipeline */}
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && mediaStream && el.srcObject !== mediaStream) {
                  el.srcObject = mediaStream;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover video-mirror ${
                isVideoEnabled && mediaStream ? 'block' : 'hidden'
              }`}
            />

            {/* Avatar when camera is turned off or loading */}
            {(!isVideoEnabled || !mediaStream) && (
              <div className="flex flex-col items-center justify-center gap-3 select-none">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-medium text-white shadow-xl"
                  style={{ backgroundColor: avatarBg }}
                >
                  {initials}
                </div>
                <span className="text-sm text-[#9aa0a6]">
                  {isCameraLoading ? 'Starting camera...' : 'Camera is off'}
                </span>
              </div>
            )}

            {/* Speaking audio wave indicator on top-right */}
            {isAudioEnabled && mediaStream && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-meet-green animate-ping' : 'bg-[#9aa0a6]'}`} />
                <div className="flex items-end gap-[3px] h-3.5">
                  <div
                    className="w-1 bg-meet-green rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (volume / 100) * 14)}px` }}
                  />
                  <div
                    className="w-1 bg-meet-green rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (volume / 100) * 16)}px` }}
                  />
                  <div
                    className="w-1 bg-meet-green rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(2, (volume / 100) * 12)}px` }}
                  />
                </div>
              </div>
            )}

            {/* Bottom floating toggle pills inside preview */}
            <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-4 z-10">
              {/* Mic Toggle Button */}
              <button
                onClick={toggleMic}
                className={`p-3.5 rounded-full transition-all shadow-lg ${
                  isAudioEnabled
                    ? 'bg-[#3c4043]/80 hover:bg-[#4e5256] text-white border border-white/10'
                    : 'bg-meet-red hover:bg-meet-redHover text-white'
                }`}
                title={isAudioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Camera Toggle Button */}
              <button
                onClick={toggleCam}
                className={`p-3.5 rounded-full transition-all shadow-lg ${
                  isVideoEnabled
                    ? 'bg-[#3c4043]/80 hover:bg-[#4e5256] text-white border border-white/10'
                    : 'bg-meet-red hover:bg-meet-redHover text-white'
                }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Feedback note if permissions failed or retry button */}
          {permissionError && (
            <div className="mt-4 p-3 bg-[#ea4335]/15 border border-[#ea4335]/40 rounded-xl flex items-center gap-3 text-xs text-[#f28b82] max-w-xl">
              <AlertTriangle className="w-5 h-5 shrink-0 text-[#ea4335]" />
              <span className="flex-1">{permissionError}</span>
              <button
                onClick={startPreview}
                className="px-3 py-1 bg-[#3c4043] hover:bg-[#5f6368] text-white rounded-md shrink-0 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Joining Actions & Name */}
        <div className="w-full lg:max-w-md flex flex-col items-center lg:items-start text-center lg:text-left">
          <h2 className="text-3xl font-normal text-white mb-2">Ready to join?</h2>
          <p className="text-sm text-[#9aa0a6] mb-6">
            Room Code: <span className="font-mono text-white font-medium">{roomId}</span>
          </p>

          {/* Name Input Box */}
          <div className="w-full mb-6">
            <label className="block text-xs text-[#9aa0a6] mb-2 font-medium">What's your name?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-[#28292c] border border-[#5f6368] focus:border-meet-blue focus:ring-1 focus:ring-meet-blue rounded-xl text-sm text-white placeholder-[#9aa0a6] outline-none transition-all"
            />
          </div>

          {/* Join Actions */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3 mb-6">
            <button
              onClick={() => handleJoin(false)}
              className="w-full sm:flex-1 py-3 px-6 bg-meet-blue hover:bg-meet-blueHover active:bg-[#1557b0] text-white font-medium rounded-full text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Join now</span>
            </button>

            <button
              onClick={() => handleJoin(true)}
              className="w-full sm:w-auto py-3 px-5 border border-[#5f6368] hover:bg-[#3c4043]/50 text-meet-blue hover:text-white font-medium rounded-full text-sm transition-all flex items-center justify-center gap-2"
              title="Join and immediately share your screen"
            >
              <MonitorUp className="w-4 h-4" />
              <span>Present</span>
            </button>
          </div>

          {/* Quick Joining Info Box */}
          <div className="w-full p-4 rounded-xl bg-[#28292c]/60 border border-[#3c4043] flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs text-[#9aa0a6]">Joining link</span>
              <span className="text-xs text-[#e8eaed] font-mono truncate max-w-[240px]">
                {window.location.origin}/?room={roomId}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg hover:bg-[#3c4043] text-meet-blue transition-colors shrink-0"
              title="Copy link"
            >
              {hasCopied ? <Check className="w-4 h-4 text-meet-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-[#9aa0a6]">
        <span>Check your audio and video before entering the meeting</span>
      </footer>
    </div>
  );
};
