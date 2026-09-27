import React, { useState } from 'react';
import { VideoTile } from './VideoTile';

export const VideoGrid = ({ allParticipants }) => {
  const [pinnedSocketId, setPinnedSocketId] = useState(null);

  const togglePin = (socketId) => {
    setPinnedSocketId((prev) =>
      prev === socketId ? null : socketId
    );
  };

  const count = allParticipants.length;

  const pinnedParticipant = pinnedSocketId
    ? allParticipants.find((p) => p.socketId === pinnedSocketId)
    : null;

  const unpinnedParticipants = pinnedParticipant
    ? allParticipants.filter((p) => p.socketId !== pinnedSocketId)
    : allParticipants;

  // Pinned participant layout
  if (pinnedParticipant) {
    return (
      <div className="w-full h-full min-h-0 flex flex-col md:flex-row gap-2 sm:gap-3 p-2 sm:p-3 overflow-hidden">
        <div className="flex-1 min-h-0 min-w-0">
          <VideoTile
            participant={pinnedParticipant}
            isPinned={true}
            onTogglePin={() => togglePin(pinnedParticipant.socketId)}
            isSingleParticipant={false}
          />
        </div>

        {unpinnedParticipants.length > 0 && (
          <div className="w-full md:w-64 h-28 sm:h-40 md:h-full flex md:flex-col gap-2 sm:gap-3 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden shrink-0">
            {unpinnedParticipants.map((participant) => (
              <div
                key={participant.socketId}
                className="w-44 sm:w-56 md:w-full h-full md:h-44 shrink-0"
              >
                <VideoTile
                  participant={participant}
                  isPinned={false}
                  onTogglePin={() => togglePin(participant.socketId)}
                  isSingleParticipant={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 1-4 participants
  if (count <= 4) {
    return (
      <div
        className="
          w-full
          h-full
          min-h-0
          p-2
          sm:p-3
          overflow-hidden
          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            w-full
            h-full
            min-h-0
            max-w-[1400px]
            grid
            gap-2
            sm:gap-3
          "
          style={{
            gridTemplateColumns: 'minmax(0, 1fr)',
            gridTemplateRows:
              count === 1
                ? 'minmax(0, 1fr)'
                : count === 2
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(2, minmax(0, 1fr))'
          }}
        >
          {allParticipants.map((participant) => (
            <div
              key={participant.socketId}
              className="
                w-full
                h-full
                min-h-0
                min-w-0
                overflow-hidden
              "
            >
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
  }

  // More than 4 participants
  let gridLayoutClass = '';

  if (count <= 6) {
    gridLayoutClass =
      'grid-cols-2 sm:grid-cols-3 grid-rows-3 sm:grid-rows-2';
  } else if (count <= 9) {
    gridLayoutClass =
      'grid-cols-2 sm:grid-cols-3 grid-rows-5 sm:grid-rows-3';
  } else {
    gridLayoutClass =
      'grid-cols-2 sm:grid-cols-4 grid-rows-6 sm:grid-rows-3';
  }

  return (
    <div
      className="
        w-full
        h-full
        min-h-0
        p-2
        sm:p-3
        flex
        items-center
        justify-center
        overflow-hidden
      "
    >
      <div
        className={`
          w-full
          h-full
          min-h-0
          grid
          ${gridLayoutClass}
          gap-2
          sm:gap-3
        `}
      >
        {allParticipants.map((participant) => (
          <div
            key={participant.socketId}
            className="
              w-full
              h-full
              min-h-0
              min-w-0
              overflow-hidden
            "
          >
            <VideoTile
              participant={participant}
              isPinned={false}
              onTogglePin={() => togglePin(participant.socketId)}
              isSingleParticipant={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};