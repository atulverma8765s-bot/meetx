import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { getAvatarColor, getInitials } from '../../utils/roomUtils';

export const ChatDrawer = ({ isOpen, onClose, messages, onSendMessage, currentSocketId }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="w-80 md:w-96 h-full bg-[#28292c] border-l border-[#3c4043] flex flex-col z-30 shrink-0 select-text">
      {/* Drawer Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#3c4043]">
        <h3 className="text-base font-medium text-white">In-call messages</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[#3c4043] text-[#9aa0a6] hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Info Notice */}
      <div className="px-5 py-3 bg-[#202124]/60 border-b border-[#3c4043]/40 text-xs text-[#9aa0a6] leading-relaxed">
        Messages can only be seen by people in the call and are deleted when the call ends.
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#9aa0a6] text-xs px-4">
            <p>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentSocketId;
            const avatarColor = getAvatarColor(msg.senderName);
            const initials = getInitials(msg.senderName);

            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-white truncate">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[10px] text-[#9aa0a6] shrink-0">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-[#e8eaed] break-words whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#3c4043]">
        <div className="flex items-center gap-2 bg-[#202124] border border-[#5f6368] focus-within:border-meet-blue rounded-full px-4 py-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send a message to everyone"
            className="flex-1 bg-transparent text-sm text-[#e8eaed] placeholder-[#9aa0a6] outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-1.5 text-meet-blue hover:text-white disabled:text-[#5f6368] transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
