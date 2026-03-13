import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

let socket = null;

export const connectSocket = (userId, role, page) => {
  // Validate required fields
  if (!userId) {
    console.warn('⚠️ Socket connect attempted without userId');
    return null;
  }

  if (socket?.connected) {
    // Already connected, just join new room
    socket.emit('join', { userId, role: role || 'customer', page: page || '/' });
    return socket;
  }

  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: {
      token: localStorage.getItem('token'),
    },
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
    // Emit join event with validated data
    socket.emit('join', {
      userId: userId,
      role: role || 'customer',
      page: page || window.location.pathname || '/',
    });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const emitPageChange = (userId, page) => {
  if (socket?.connected) {
    socket.emit('page:change', { userId, page });
  }
};

export const emitStaffStatusUpdate = (userId, status, department) => {
  if (socket?.connected) {
    socket.emit('staff:status:update', { userId, status, department });
  }
};

export const subscribeToOrderUpdates = (callback) => {
  const sock = getSocket();
  sock.on('order:updated', callback);
  return () => sock.off('order:updated', callback);
};

export const subscribeToPaymentUpdates = (callback) => {
  const sock = getSocket();
  sock.on('payment:verified', callback);
  return () => sock.off('payment:verified', callback);
};

export const subscribeToQueueUpdates = (callback) => {
  const sock = getSocket();
  sock.on('queue:updated', callback);
  return () => sock.off('queue:updated', callback);
};

export const subscribeToUserCount = (callback) => {
  const sock = getSocket();
  sock.on('users:count', callback);
  return () => sock.off('users:count', callback);
};

export const subscribeToStaffStatus = (callback) => {
  const sock = getSocket();
  sock.on('staff:status', callback);
  return () => sock.off('staff:status', callback);
};

export const subscribeToUserActivity = (callback) => {
  const sock = getSocket();
  sock.on('user:activity', callback);
  return () => sock.off('user:activity', callback);
};

export const subscribeToNotifications = (callback) => {
  const sock = getSocket();
  sock.on('notification', callback);
  return () => sock.off('notification', callback);
};
