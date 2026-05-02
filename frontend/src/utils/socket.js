import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000'); // Ensure this matches your backend URL

export default socket;
