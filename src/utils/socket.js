// Use dynamic import to avoid Next.js issues with Socket.IO
let socketIOPromise;
let socket;

// Get the API URL from environment variables or use a default
// Remove the /api path from the end if it exists since socket.io needs the base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

const getSocketIO = async () => {
  if (!socketIOPromise) {
    socketIOPromise = import('socket.io-client').then(module => module.io);
  }
  return socketIOPromise;
};

// Initialize socket connection
export const initSocket = async () => {
  // Only initialize once
  if (socket) return socket;
  
  try {
    // Dynamically import socket.io-client
    const io = await getSocketIO();
    
    // Create socket connection with explicit default namespace
    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,
      path: '/socket.io',
    });

    // Register event handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

// Get or initialize socket
export const getSocket = async () => {
  if (!socket) {
    return await initSocket();
  }
  return socket;
};

// Join a pet's comment room
export const joinPetRoom = async (petId) => {
  if (!petId) return;
  
  try {
    const socketInstance = await getSocket();
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('join_pet_room', petId);
    } else {
      console.warn('Socket not connected when trying to join room for petId:', petId);
    }
  } catch (error) {
    console.error('Error joining pet room:', error);
  }
};

// Leave a pet's comment room
export const leavePetRoom = async (petId) => {
  if (!petId) return;
  
  try {
    const socketInstance = await getSocket();
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('leave_pet_room', petId);
    }
  } catch (error) {
    console.error('Error leaving pet room:', error);
  }
};

// Listen for new comments
export const onNewComment = async (callback) => {
  try {
    const socketInstance = await getSocket();
    if (socketInstance) {
      // Remove any existing listeners to prevent duplicates
      socketInstance.off('new_comment');
      // Add the new listener
      socketInstance.on('new_comment', callback);
    }
  } catch (error) {
    console.error('Error setting up new comment listener:', error);
  }
};

// Remove comment listener
export const offNewComment = async () => {
  try {
    const socketInstance = await getSocket();
    if (socketInstance) {
      socketInstance.off('new_comment');
    }
  } catch (error) {
    console.error('Error removing new comment listener:', error);
  }
};

// Clean up socket connection
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  initSocket,
  getSocket,
  joinPetRoom,
  leavePetRoom,
  onNewComment,
  offNewComment,
  disconnectSocket,
}; 