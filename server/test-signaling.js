import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const TEST_ROOM = 'test-unit-meet';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTestSuite() {
  console.log('🧪 Starting MeetX Automated Integration Test Suite...\n');
  let testsPassed = 0;
  let testsTotal = 0;

  function assert(condition, testName) {
    testsTotal++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Test HTTP Health API
  console.log('1️⃣ Testing HTTP API Endpoints...');
  const healthRes = await fetch(`${SERVER_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returns 200 OK');

  const clientRes = await fetch(`${SERVER_URL}/`);
  const clientHtml = await clientRes.text();
  assert(clientRes.status === 200 && clientHtml.includes('MeetX'), 'GET / serves MeetX client HTML');

  // 2. Test Multi-Client Socket.io Connections
  console.log('\n2️⃣ Testing Real-Time WebRTC Signaling & Room State...');
  const socketAlice = io(SERVER_URL, { transports: ['websocket'] });
  const socketBob = io(SERVER_URL, { transports: ['websocket'] });

  await Promise.race([
    Promise.all([
      new Promise((res) => socketAlice.on('connect', res)),
      new Promise((res) => socketBob.on('connect', res))
    ]),
    new Promise((_, rej) => setTimeout(() => rej(new Error('Connection timed out')), 5000))
  ]);
  assert(socketAlice.id && socketBob.id, 'Both Alice and Bob connected via WebSockets');

  // Alice joins room
  console.log('\n3️⃣ Testing User Join & Room Discovery...');
  const aliceRoomPromise = new Promise((res) => {
    socketAlice.once('room-users', (data) => res(data));
  });
  socketAlice.emit('join-room', {
    roomId: TEST_ROOM,
    user: { name: 'Alice (Host)', audioEnabled: true, videoEnabled: true }
  });
  const aliceRoomData = await aliceRoomPromise;
  assert(aliceRoomData.currentUser.isHost === true, 'Alice joined as meeting Host');

  // Bob joins room
  const aliceSeesBobPromise = new Promise((res) => {
    socketAlice.once('user-joined', (user) => res(user));
  });
  const bobRoomPromise = new Promise((res) => {
    socketBob.once('room-users', (data) => res(data));
  });

  socketBob.emit('join-room', {
    roomId: TEST_ROOM,
    user: { name: 'Bob', audioEnabled: true, videoEnabled: true }
  });

  const [bobJoinedEvent, bobRoomData] = await Promise.all([
    aliceSeesBobPromise,
    bobRoomPromise
  ]);

  assert(bobJoinedEvent.name === 'Bob', 'Alice received user-joined event for Bob');
  assert(bobRoomData.users.some((u) => u.name === 'Alice (Host)'), 'Bob received Alice in room-users roster');

  // 3. WebRTC Signaling: Offer & Answer
  console.log('\n4️⃣ Testing WebRTC SDP Offer / Answer Exchange...');
  const bobReceivesOfferPromise = new Promise((res) => {
    socketBob.once('signal:offer', (data) => res(data));
  });

  socketAlice.emit('signal:offer', {
    to: socketBob.id,
    offer: { type: 'offer', sdp: 'v=0\r\no=alice 12345 1 IN IP4 127.0.0.1' }
  });
  const receivedOffer = await bobReceivesOfferPromise;
  assert(receivedOffer.from === socketAlice.id && receivedOffer.offer.type === 'offer', 'Bob received SDP offer from Alice');

  const aliceReceivesAnswerPromise = new Promise((res) => {
    socketAlice.once('signal:answer', (data) => res(data));
  });
  socketBob.emit('signal:answer', {
    to: socketAlice.id,
    answer: { type: 'answer', sdp: 'v=0\r\no=bob 67890 1 IN IP4 127.0.0.1' }
  });
  const receivedAnswer = await aliceReceivesAnswerPromise;
  assert(receivedAnswer.from === socketBob.id && receivedAnswer.answer.type === 'answer', 'Alice received SDP answer from Bob');

  // 4. Test In-Call Chat
  console.log('\n5️⃣ Testing In-Call Chat Broadcasting...');
  const chatPromise = new Promise((res) => {
    socketBob.once('chat:message', (msg) => res(msg));
  });
  socketAlice.emit('chat:message', {
    roomId: TEST_ROOM,
    message: { text: 'Hello everyone in MeetX!' }
  });
  const receivedMsg = await chatPromise;
  assert(receivedMsg.text === 'Hello everyone in MeetX!' && receivedMsg.senderName === 'Alice (Host)', 'Bob received real-time chat message from Alice');

  // 5. Test Floating Reactions
  console.log('\n6️⃣ Testing Floating Reactions...');
  const reactionPromise = new Promise((res) => {
    socketAlice.once('reaction:receive', (r) => res(r));
  });
  socketBob.emit('reaction:send', { roomId: TEST_ROOM, emoji: '🔥' });
  const receivedReaction = await reactionPromise;
  assert(receivedReaction.emoji === '🔥', 'Alice received Bob\'s floating emoji reaction 🔥');

  // 6. Test Hand Raise
  console.log('\n7️⃣ Testing Hand Raise Sync...');
  const handPromise = new Promise((res) => {
    socketAlice.once('user:hand-raised', (h) => res(h));
  });
  socketBob.emit('user:raise-hand', { roomId: TEST_ROOM, isHandRaised: true });
  const receivedHand = await handPromise;
  assert(receivedHand.isHandRaised === true && receivedHand.socketId === socketBob.id, 'Alice received Bob\'s hand-raised notification');

  // 7. Test Collaborative Whiteboard
  console.log('\n8️⃣ Testing Collaborative Whiteboard...');
  const drawPromise = new Promise((res) => {
    socketBob.once('whiteboard:draw', (d) => res(d));
  });
  const mockStroke = { x0: 0.1, y0: 0.2, x1: 0.3, y1: 0.4, color: '#1a73e8', lineWidth: 3 };
  socketAlice.emit('whiteboard:draw', { roomId: TEST_ROOM, drawData: mockStroke });
  const receivedDraw = await drawPromise;
  assert(receivedDraw.color === '#1a73e8' && receivedDraw.x1 === 0.3, 'Bob received Alice\'s whiteboard drawing stroke');

  // 8. Test User Leave
  console.log('\n9️⃣ Testing User Leave Event...');
  const leavePromise = new Promise((res) => {
    socketAlice.once('user-left', (u) => res(u));
  });
  const bobId = socketBob.id;
  socketBob.disconnect();
  const leftUser = await leavePromise;
  assert(leftUser.socketId === bobId, 'Alice received user-left notification when Bob disconnected');

  socketAlice.disconnect();

  console.log(`\n🎉 All ${testsPassed}/${testsTotal} automated tests PASSED successfully!`);
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
