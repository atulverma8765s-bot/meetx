import React, { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon, Paperclip } from 'lucide-react';

export const DetailsDrawer = ({ isOpen, onClose, roomId }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('joining'); // 'joining' | 'attachments'

  if (!isOpen) return null;

  const meetingUrl = `${window.location.origin}/?room=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="w-80 md:w-96 h-full bg-[#28292c] border-l border-[#3c4043] flex flex-col z-30 shrink-0 select-text">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#3c4043]">
        <h3 className="text-base font-medium text-white">Meeting details</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#3c4043]">
        <button
          onClick={() => setActiveTab('joining')}
          className={`flex-1 py-3 text-xs font-medium text-center border-b-2 transition-colors ${
            activeTab === 'joining'
              ? 'border-meet-blue text-meet-blue'
              : 'border-transparent text-[#9aa0a6] hover:text-white'
          }`}
        >
          Joining info
        </button>
        <button
          onClick={() => setActiveTab('attachments')}
          className={`flex-1 py-3 text-xs font-medium text-center border-b-2 transition-colors ${
            activeTab === 'attachments'
              ? 'border-meet-blue text-meet-blue'
              : 'border-transparent text-[#9aa0a6] hover:text-white'
          }`}
        >
          Attachments
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'joining' ? (
          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#9aa0a6] block mb-1">Joining info</span>
              <p className="text-sm text-white font-mono break-all">{meetingUrl}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#5f6368] hover:bg-[#3c4043] text-meet-blue hover:text-white text-xs font-medium transition-colors"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4 text-meet-green" />
                  <span>Joining info copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy joining info</span>
                </>
              )}
            </button>

            <div className="pt-4 border-t border-[#3c4043]/50 text-xs text-[#9aa0a6] space-y-2">
              <p>
                <strong className="text-white font-medium">Meeting Code:</strong> {roomId}
              </p>
              <p>
                All video and audio calls are direct peer-to-peer WebRTC encrypted.
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#9aa0a6] text-xs">
            <Paperclip className="w-8 h-8 mb-2 opacity-50" />
            <p>Attachments from Google Calendar will show here</p>
          </div>
        )}
      </div>
    </div>
  );
};
