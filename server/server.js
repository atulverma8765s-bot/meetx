import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rooms state: Map<roomId, Map<socketId, UserData>>
const rooms = new Map();

// Whiteboard state per room: Map<roomId, Array<drawAction>>
const whiteboardStates = new Map();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  res.json({
    exists: !!room && room.size > 0,
    participantCount: room ? room.size : 0
  });
});

// Serve client in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('MeetX Signaling Server running. Client UI not built yet.');
    }
  });
});

io.on('connection', (socket) => {
  let currentRoomId = null;

  socket.on('join-room', ({ roomId, user }) => {
    currentRoomId = roomId;
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
      whiteboardStates.set(roomId, []);
    }

    const room = rooms.get(roomId);
    const isFirstParticipant = room.size === 0;

    const userData = {
      socketId: socket.id,
      name: user.name || 'Guest Participant',
      audioEnabled: user.audioEnabled !== false,
      videoEnabled: user.videoEnabled !== false,
      isScreenSharing: false,
      isHandRaised: false,
      isHost: isFirstParticipant,
      joinedAt: Date.now()
    };

    // Inform the new user about existing participants in the room
    const existingUsers = Array.from(room.values());
    socket.emit('room-users', {
      users: existingUsers,
      currentUser: userData,
      whiteboardHistory: whiteboardStates.get(roomId) || []
    });

    // Save user to the room map
    room.set(socket.id, userData);

    // Notify all existing users in the room about the new participant
    socket.to(roomId).emit('user-joined', userData);

    console.log(`[Join] User ${userData.name} (${socket.id}) joined room ${roomId}. Room size: ${room.size}`);
  });

  // WebRTC Signaling: Offer
  socket.on('signal:offer', ({ to, offer }) => {
    io.to(to).emit('signal:offer', {
      from: socket.id,
      offer
    });
  });

  // WebRTC Signaling: Answer
  socket.on('signal:answer', ({ to, answer }) => {
    io.to(to).emit('signal:answer', {
      from: socket.id,
      answer
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('signal:ice-candidate', ({ to, candidate }) => {
    io.to(to).emit('signal:ice-candidate', {
      from: socket.id,
      candidate
    });
  });

  // Toggle Audio / Video State
  socket.on('user:toggle-media', ({ roomId, type, enabled }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      if (type === 'audio') user.audioEnabled = enabled;
      if (type === 'video') user.videoEnabled = enabled;
      io.in(roomId).emit('user:media-updated', {
        socketId: socket.id,
        type,
        enabled
      });
    }
  });

  // Screen Sharing State
  socket.on('user:toggle-screen-share', ({ roomId, isScreenSharing }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      user.isScreenSharing = isScreenSharing;
      io.in(roomId).emit('user:screen-share-updated', {
        socketId: socket.id,
        isScreenSharing
      });
    }
  });

  // Hand Raise State
  socket.on('user:raise-hand', ({ roomId, isHandRaised }) => {
    const room = rooms.get(roomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      user.isHandRaised = isHandRaised;
      io.in(roomId).emit('user:hand-raised', {
        socketId: socket.id,
        userName: user.name,
        isHandRaised
      });
    }
  });

  // In-Call Chat Message
  socket.on('chat:message', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    const user = room?.get(socket.id);
    const chatPayload = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: socket.id,
      senderName: user ? user.name : 'Unknown',
      text: message.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.in(roomId).emit('chat:message', chatPayload);
  });

  // Emoji Reactions
  socket.on('reaction:send', ({ roomId, emoji }) => {
    const room = rooms.get(roomId);
    const user = room?.get(socket.id);
    io.in(roomId).emit('reaction:receive', {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      socketId: socket.id,
      senderName: user ? user.name : '',
      emoji
    });
  });

  // Collaborative Whiteboard
  socket.on('whiteboard:draw', ({ roomId, drawData }) => {
    const history = whiteboardStates.get(roomId);
    if (history) {
      history.push(drawData);
      // Limit history to last 5000 draw actions to prevent memory bloat
      if (history.length > 5000) history.shift();
    }
    socket.to(roomId).emit('whiteboard:draw', drawData);
  });

  socket.on('whiteboard:clear', ({ roomId }) => {
    whiteboardStates.set(roomId, []);
    io.in(roomId).emit('whiteboard:clear');
  });

  // Host Action: Force Mute
  socket.on('host:mute-user', ({ roomId, targetSocketId }) => {
    const room = rooms.get(roomId);
    const caller = room?.get(socket.id);
    if (caller && caller.isHost) {
      io.to(targetSocketId).emit('host:force-mute');
    }
  });

  // Disconnection cleanup
  const handleLeave = () => {
    if (!currentRoomId) return;
    const room = rooms.get(currentRoomId);
    if (room && room.has(socket.id)) {
      const user = room.get(socket.id);
      room.delete(socket.id);

      // Use io.to to reliably deliver to remaining participants in the room
      io.to(currentRoomId).emit('user-left', {
        socketId: socket.id,
        name: user.name
      });

      console.log(`[Leave] User ${user.name} (${socket.id}) left room ${currentRoomId}. Remaining: ${room.size}`);

      // If room is empty, clear room and whiteboard after 5 minutes
      if (room.size === 0) {
        setTimeout(() => {
          if (rooms.get(currentRoomId)?.size === 0) {
            rooms.delete(currentRoomId);
            whiteboardStates.delete(currentRoomId);
            console.log(`[Clean] Cleared empty room: ${currentRoomId}`);
          }
        }, 5 * 60 * 1000);
      }
    }
  };

  socket.on('leave-room', handleLeave);
  socket.on('disconnect', handleLeave);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MeetX Signaling Server running on http://localhost:${PORT}`);
});
