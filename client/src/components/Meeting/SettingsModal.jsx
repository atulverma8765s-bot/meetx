import React, { useState, useEffect } from 'react';
import { X, Mic, Video, Volume2, Check } from 'lucide-react';
import { playJoinSound } from '../../utils/soundEffects';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [audioInputs, setAudioInputs] = useState([]);
  const [videoInputs, setVideoInputs] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((d) => d.kind === 'audioinput');
        const cams = devices.filter((d) => d.kind === 'videoinput');

        setAudioInputs(mics);
        setVideoInputs(cams);

        if (mics.length > 0 && !selectedAudio) setSelectedAudio(mics[0].deviceId);
        if (cams.length > 0 && !selectedVideo) setSelectedVideo(cams[0].deviceId);
      } catch (err) {
        console.warn('Could not enumerate devices:', err);
      }
    };

    getDevices();
  }, [isOpen, selectedAudio, selectedVideo]);

  if (!isOpen) return null;

  const testSpeakers = () => {
    setIsTestingSpeaker(true);
    playJoinSound();
    setTimeout(() => setIsTestingSpeaker(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div className="bg-[#28292c] border border-[#3c4043] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3c4043]">
          <h3 className="text-xl font-normal text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Audio Input (Microphone) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#bdc1c6] mb-2 font-medium">
              <Mic className="w-4 h-4 text-meet-blue" />
              <span>Microphone</span>
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full bg-[#202124] border border-[#5f6368] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-meet-blue"
            >
              {audioInputs.length === 0 ? (
                <option value="">Default Microphone</option>
              ) : (
                audioInputs.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Microphone ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Speakers Test */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#bdc1c6] mb-2 font-medium">
              <Volume2 className="w-4 h-4 text-meet-green" />
              <span>Speakers</span>
            </label>
            <div className="flex items-center justify-between bg-[#202124] border border-[#3c4043] rounded-xl p-3">
              <span className="text-sm text-[#9aa0a6]">System Default Speakers</span>
              <button
                onClick={testSpeakers}
                className="px-3.5 py-1.5 rounded-lg bg-[#3c4043] hover:bg-[#4e5256] text-xs font-medium text-white transition-colors flex items-center gap-1.5"
              >
                {isTestingSpeaker ? <Check className="w-3.5 h-3.5 text-meet-green" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isTestingSpeaker ? 'Playing...' : 'Test'}</span>
              </button>
            </div>
          </div>

          {/* Video Input (Camera) */}
          <div>
            <label className="flex items-center gap-2 text-sm text-[#bdc1c6] mb-2 font-medium">
              <Video className="w-4 h-4 text-meet-yellow" />
              <span>Camera</span>
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full bg-[#202124] border border-[#5f6368] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-meet-blue"
            >
              {videoInputs.length === 0 ? (
                <option value="">Default Camera</option>
              ) : (
                videoInputs.map((d, idx) => (
                  <option key={d.deviceId || idx} value={d.deviceId}>
                    {d.label || `Camera ${idx + 1}`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#3c4043] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-meet-blue hover:bg-meet-blueHover text-white text-sm font-medium rounded-full transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
