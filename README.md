# MeetX - Google Meet Clone

MeetX is a modern, real-time video conferencing web application inspired by Google Meet. Built with WebRTC mesh architecture, Node.js, Express, Socket.io, React 18, and Tailwind CSS.

![MeetX Preview](https://raw.githubusercontent.com/google/material-design-icons/master/png/communication/video_call/materialicons/48dp/2x/baseline_video_call_white_48dp.png)

---

## ✨ Features

- **Google Meet Aesthetic**: Authentic dark theme (`#202124`), rounded pill action bar, Google Meet typography and color palette.
- **Meeting Codes & Links**: Formatted Google Meet style codes (e.g. `abc-defg-hij`) with instant generation and link sharing.
- **Pre-Join Green Room (Lobby)**: Live webcam preview, microphone level visualizer (equalizer bars), audio test, name input, and "Join now" or "Present" buttons.
- **Peer-to-Peer WebRTC Audio/Video**: Direct mesh streaming with public Google STUN servers.
- **Active Speaker Detection**: Real-time Web Audio API frequency analyser detecting who is speaking and highlighting their tile with a glowing blue border.
- **Dynamic Auto-Responsive Grid**: Automatically arranges 1 to 12+ participants (single view, 2-way split, 2x2, 3x2, or 3x3) with full-screen pin/spotlight mode.
- **Screen Sharing**: Present your entire screen, window, or tab via `getDisplayMedia` with automatic stream negotiation.
- **Floating Emoji Reactions**: Google Meet-style floating animated emojis (❤️, 👍, 👏, 🎉, 😂, 😮, 🔥) that float up the screen and sync across peers.
- **Hand Raising**: Raise or lower hand with chime notification, animated badge on user tile, and indicator in People drawer.
- **Real-Time In-Call Chat**: Message history, timestamps, unread notification dots, and sound alerts.
- **Collaborative Whiteboard**: Interactive real-time whiteboard canvas with colors, brush sizes, eraser, and synchronized drawing across all participants.
- **People & Details Drawers**: Participant roster with host mute capabilities, meeting link with one-click copy.
- **Keyboard Shortcuts**:
  - `Ctrl + D` / `Cmd + D`: Toggle Microphone (Mute / Unmute)
  - `Ctrl + E` / `Cmd + E`: Toggle Camera (Video On / Off)
- **Audio Feedback**: Synthesized Web Audio chimes for join, leave, chat message, and hand raise without any external audio file dependencies.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm**

### 2. Run the Application

You can start the full application (Signaling server + Client):

```bash
# Option A: Start production server (serves both API & Frontend on http://localhost:5000)
npm run build
npm start
```

Or for development with Hot Module Replacement (HMR):

```bash
# Start backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

Open your browser to:
- **Production**: `http://localhost:5000`
- **Development**: `http://localhost:5173`

---

## 🧪 Testing with Multiple Participants

You can test video calls directly on your computer:
1. Open `http://localhost:5000` in your main browser window.
2. Click **New meeting** -> **Start an instant meeting**.
3. Allow camera/mic permissions, enter your name, and click **Join now**.
4. Copy the meeting link or code from the details drawer or URL.
5. Open an **Incognito Window** or a secondary browser (Chrome / Edge / Firefox) and paste the URL (e.g. `http://localhost:5000/?room=abc-defg-hij`).
6. Enter a different name and join. Both video feeds will connect immediately via WebRTC!
