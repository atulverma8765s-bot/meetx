import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { playJoinSound, playLeaveSound, playHandRaiseSound } from '../utils/soundEffects';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};

export const useWebRTC = (roomId, initialUser, initialStream) => {
  const [localStream, setLocalStream] = useState(initialStream || null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]); // Remote participants: { socketId, name, stream, audioEnabled, videoEnabled, isScreenSharing, isHandRaised }
  const [currentUser, setCurrentUser] = useState(initialUser || { name: 'You', audioEnabled: true, videoEnabled: true, isHost: false });
  const [chatMessages, setChatMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [whiteboardHistory, setWhiteboardHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'

  const socketRef = useRef(null);
  const peerConnections = useRef(new Map()); // socketId -> RTCPeerConnection
  const pendingCandidates = useRef(new Map()); // socketId -> RTCIceCandidate[]
  const localStreamRef = useRef(initialStream || null);
  const screenStreamRef = useRef(null);

  // Keep localStreamRef synced
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Ensure localStream is healthy; auto-acquire if missing or ended
  useEffect(() => {
    const isStreamHealthy =
      localStream &&
      localStream.getTracks().length > 0 &&
      localStream.getTracks().some((t) => t.readyState === 'live');

    if (!isStreamHealthy && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true
        })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: true }))
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true }))
        .then((freshStream) => {
          setLocalStream(freshStream);
          const vt = freshStream.getVideoTracks()[0];
          if (vt) vt.enabled = currentUser.videoEnabled;
          const at = freshStream.getAudioTracks()[0];
          if (at) at.enabled = currentUser.audioEnabled;

          peerConnections.current.forEach((pc) => {
            freshStream.getTracks().forEach((track) => {
              const sender = pc.getSenders().find((s) => s.track && s.track.kind === track.kind);
              if (sender) {
                sender.replaceTrack(track);
              } else {
                pc.addTrack(track, freshStream);
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[WebRTC] Stream auto-acquisition failed:', err);
        });
    }
  }, [localStream, currentUser.videoEnabled, currentUser.audioEnabled]);

  // Create Peer Connection helper
  const createPeerConnection = useCallback((remoteSocketId, remoteName) => {
    if (peerConnections.current.has(remoteSocketId)) {
      return peerConnections.current.get(remoteSocketId);
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current.set(remoteSocketId, pc);

    // Add local tracks (either screen or camera)
    const streamToShare = screenStreamRef.current || localStreamRef.current;
    if (streamToShare) {
      streamToShare.getTracks().forEach((track) => {
        pc.addTrack(track, streamToShare);
      });
    }

    // ICE Candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal:ice-candidate', {
          to: remoteSocketId,
          candidate: event.candidate
        });
      }
    };

    // Remote Track handler
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipants((prev) => {
        return prev.map((p) => {
          if (p.socketId === remoteSocketId) {
            return { ...p, stream: remoteStream };
          }
          return p;
        });
      });
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${remoteSocketId} state:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        pc.close();
        peerConnections.current.delete(remoteSocketId);
      }
    };

    return pc;
  }, []);

  // Initialize Socket.io and Room Connection
  useEffect(() => {
    if (!roomId) return;

    // Use current origin or fallback for local dev
    const socket = io('/', {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected with ID:', socket.id);
      setConnectionStatus('connected');

      // Join room
      socket.emit('join-room', {
        roomId,
        user: {
          name: currentUser.name,
          audioEnabled: currentUser.audioEnabled,
          videoEnabled: currentUser.videoEnabled
        }
      });
    });

    // Received list of existing participants from server
    socket.on('room-users', ({ users, currentUser: myData, whiteboardHistory: wbHistory }) => {
      setCurrentUser((prev) => ({ ...prev, ...myData }));
      if (wbHistory) setWhiteboardHistory(wbHistory);

      // Add other participants to state
      const remoteUsers = users.map((u) => ({
        ...u,
        stream: null
      }));
      setParticipants(remoteUsers);

      // Create offers to all existing peers
      users.forEach(async (user) => {
        try {
          const pc = createPeerConnection(user.socketId, user.name);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit('signal:offer', {
            to: user.socketId,
            offer
          });
        } catch (err) {
          console.error('[WebRTC] Error initiating offer to:', user.socketId, err);
        }
      });
    });

    // A new user joined the room
    socket.on('user-joined', (newUser) => {
      playJoinSound();
      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === newUser.socketId)) return prev;
        return [...prev, { ...newUser, stream: null }];
      });
    });

    // WebRTC Offer received
    socket.on('signal:offer', async ({ from, offer }) => {
      try {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process any queued ICE candidates
        const pending = pendingCandidates.current.get(from) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidates.current.delete(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('signal:answer', {
          to: from,
          answer
        });
      } catch (err) {
        console.error('[WebRTC] Error responding to offer:', err);
      }
    });

    // WebRTC Answer received
    socket.on('signal:answer', async ({ from, answer }) => {
      try {
        const pc = peerConnections.current.get(from);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Process queued candidates
          const pending = pendingCandidates.current.get(from) || [];
          for (const candidate of pending) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidates.current.delete(from);
        }
      } catch (err) {
        console.error('[WebRTC] Error setting remote answer:', err);
      }
    });

    // WebRTC ICE Candidate received
    socket.on('signal:ice-candidate', async ({ from, candidate }) => {
      try {
        const pc = peerConnections.current.get(from);
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate until remote description is ready
          const list = pendingCandidates.current.get(from) || [];
          list.push(candidate);
          pendingCandidates.current.set(from, list);
        }
      } catch (err) {
        console.error('[WebRTC] Error adding ICE candidate:', err);
      }
    });

    // Remote user media toggled (mic or camera)
    socket.on('user:media-updated', ({ socketId, type, enabled }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId === socketId) {
            return {
              ...p,
              audioEnabled: type === 'audio' ? enabled : p.audioEnabled,
              videoEnabled: type === 'video' ? enabled : p.videoEnabled
            };
          }
          return p;
        })
      );
    });

    // Remote user screen share toggled
    socket.on('user:screen-share-updated', ({ socketId, isScreenSharing: sharing }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId === socketId) {
            return { ...p, isScreenSharing: sharing };
          }
          return p;
        })
      );
    });

    // Remote user hand raised
    socket.on('user:hand-raised', ({ socketId, isHandRaised }) => {
      if (isHandRaised) playHandRaiseSound();
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId === socketId) {
            return { ...p, isHandRaised };
          }
          return p;
        })
      );
    });

    // Chat message received
    socket.on('chat:message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Emoji reaction received
    socket.on('reaction:receive', (reaction) => {
      setReactions((prev) => [...prev.slice(-15), reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3000);
    });

    // Whiteboard events
    socket.on('whiteboard:draw', (drawData) => {
      setWhiteboardHistory((prev) => [...prev, drawData]);
    });

    socket.on('whiteboard:clear', () => {
      setWhiteboardHistory([]);
    });

    // Host force mute
    socket.on('host:force-mute', () => {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }
      setCurrentUser((prev) => ({ ...prev, audioEnabled: false }));
      socket.emit('user:toggle-media', { roomId, type: 'audio', enabled: false });
    });

    // Remote participant left
    socket.on('user-left', ({ socketId }) => {
      playLeaveSound();
      const pc = peerConnections.current.get(socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(socketId);
      }
      setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    return () => {
      socket.disconnect();
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
    };
  }, [roomId, createPeerConnection]);

  // Toggle Microphone
  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      setCurrentUser((prev) => ({ ...prev, audioEnabled: newState }));
      if (socketRef.current) {
        socketRef.current.emit('user:toggle-media', {
          roomId,
          type: 'audio',
          enabled: newState
        });
      }
    }
  }, [localStream, roomId]);

  // Toggle Camera
  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      setCurrentUser((prev) => ({ ...prev, videoEnabled: newState }));
      if (socketRef.current) {
        socketRef.current.emit('user:toggle-media', {
          roomId,
          type: 'video',
          enabled: newState
        });
      }
    }
  }, [localStream, roomId]);

  // Toggle Screen Share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing and switch back to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }

      if (socketRef.current) {
        socketRef.current.emit('user:toggle-screen-share', { roomId, isScreenSharing: false });
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        screenStreamRef.current = displayStream;
        setScreenStream(displayStream);
        setIsScreenSharing(true);

        const screenVideoTrack = displayStream.getVideoTracks()[0];

        // Replace video track for all peers
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenVideoTrack);
          }
        });

        // Handle user stopping share via native browser button
        screenVideoTrack.onended = () => {
          toggleScreenShare();
        };

        if (socketRef.current) {
          socketRef.current.emit('user:toggle-screen-share', { roomId, isScreenSharing: true });
        }
      } catch (err) {
        console.warn('[ScreenShare] Cancelled or failed:', err);
      }
    }
  }, [isScreenSharing, roomId]);

  // Toggle Raise Hand
  const toggleRaiseHand = useCallback(() => {
    setCurrentUser((prev) => {
      const newState = !prev.isHandRaised;
      if (newState) playHandRaiseSound();
      if (socketRef.current) {
        socketRef.current.emit('user:raise-hand', {
          roomId,
          isHandRaised: newState
        });
      }
      return { ...prev, isHandRaised: newState };
    });
  }, [roomId]);

  // Send Chat Message
  const sendChatMessage = useCallback((text) => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:message', {
      roomId,
      message: { text: text.trim() }
    });
  }, [roomId]);

  // Send Emoji Reaction
  const sendReaction = useCallback((emoji) => {
    if (!socketRef.current) return;
    socketRef.current.emit('reaction:send', { roomId, emoji });
  }, [roomId]);

  // Whiteboard drawing emit
  const emitDraw = useCallback((drawData) => {
    setWhiteboardHistory((prev) => [...prev, drawData]);
    if (socketRef.current) {
      socketRef.current.emit('whiteboard:draw', { roomId, drawData });
    }
  }, [roomId]);

  // Whiteboard clear emit
  const clearWhiteboard = useCallback(() => {
    setWhiteboardHistory([]);
    if (socketRef.current) {
      socketRef.current.emit('whiteboard:clear', { roomId });
    }
  }, [roomId]);

  // Host Action: Mute Remote User
  const forceMuteUser = useCallback((targetSocketId) => {
    if (socketRef.current && currentUser.isHost) {
      socketRef.current.emit('host:mute-user', { roomId, targetSocketId });
    }
  }, [roomId, currentUser.isHost]);

  // Leave Call
  const leaveCall = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room');
      socketRef.current.disconnect();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
  }, []);

  return {
    localStream,
    setLocalStream,
    screenStream,
    isScreenSharing,
    participants,
    currentUser,
    chatMessages,
    reactions,
    whiteboardHistory,
    connectionStatus,
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
  };
};
