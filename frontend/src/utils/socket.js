import { io } from 'socket.io-client';

// Socket.IO is disabled for Vercel compatibility (Serverless doesn't support persistent WebSockets)
// If you move to a persistent server (like Render), uncomment the line below.
// const socket = io(import.meta.env.VITE_API_URL || 'https://sprintly-eta.vercel.app');

const socket = {
  on: () => {},
  off: () => {},
  emit: () => {},
  connected: false
};

export default socket;
