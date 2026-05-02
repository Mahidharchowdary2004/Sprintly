import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'https://sprintly-eta.vercel.app'); // Ensure this matches your backend URL

export default socket;
