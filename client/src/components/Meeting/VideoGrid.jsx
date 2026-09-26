import React, { useState } from 'react';
import { VideoTile } from './VideoTile';

export const VideoGrid = ({ allParticipants }) => {
  const [pinnedSocketId, setPinnedSocketId] = useState(null);

  const togglePin = (socketId) => {
    setPinnedSocketId((prev) => (prev === socketId ? null : socketId));
  };

  const count = allParticipants.length;
  const pinnedParticipant = pinnedSocketId
    ? allParticipants.find((p) => p.socketId === pinnedSocketId)
    : null;
  const unpinnedParticipants = pinnedParticipant
    ? allParticipants.filter((p) => p.socketId !== pinnedSocketId)
    : allParticipants;

  // If a participant is pinned, render Spotlight Layout
  if (pinnedParticipant) {
    return (
      <div className="w-full h-full flex flex-col md:flex-row gap-3 p-3 overflow-hidden">
        {/* Main Spotlight Tile */}
        <div className="flex-1 h-full min-h-0 min-w-0">
          <VideoTile
            participant={pinnedParticipant}
            isPinned={true}
            onTogglePin={() => togglePin(pinnedParticipant.socketId)}
            isSingleParticipant={false}
          />
        </div>

        {/* Sidebar Filmstrip */}
        {unpinnedParticipants.length > 0 && (
          <div className="w-full md:w-64 h-48 md:h-full flex md:flex-col gap-3 overflow-y-auto overflow-x-auto shrink-0 pr-1">
            {unpinnedParticipants.map((p) => (
              <div key={p.socketId} className="w-56 md:w-full h-36 md:h-44 shrink-0">
                <VideoTile
                  participant={p}
                  isPinned={false}
                  onTogglePin={() => togglePin(p.socketId)}
                  isSingleParticipant={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Auto-Responsive Grid Layout for 1 to 12 participants
  let gridLayoutClass = 'grid-cols-1 grid-rows-1';
  if (count === 2) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 grid-rows-1';
  } else if (count === 3 || count === 4) {
    gridLayoutClass = 'grid-cols-1 sm:grid-cols-2 grid-rows-2';
  } else if (count >= 5 && count <= 6) {
    gridLayoutClass = 'grid-cols-2 sm:grid-cols-3 grid-rows-2';
  } else if (count >= 7 && count <= 9) {
    gridLayoutClass = 'grid-cols-2 sm:grid-cols-3 grid-rows-3';
  } else if (count > 9) {
    gridLayoutClass = 'grid-cols-3 sm:grid-cols-4 grid-rows-3';
  }

  return (
    <div className="w-full h-full p-3 flex items-center justify-center overflow-hidden">
      <div
        className={`w-full h-full max-w-7xl max-h-full grid ${gridLayoutClass} gap-3 items-center justify-center`}
      >
        {allParticipants.map((participant) => (
          <div key={participant.socketId} className="w-full h-full min-h-[140px] flex items-center justify-center">
            <VideoTile
              participant={participant}
              isPinned={false}
              onTogglePin={() => togglePin(participant.socketId)}
              isSingleParticipant={count === 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
