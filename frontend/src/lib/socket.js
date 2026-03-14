import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

let socket = null;

export const connectSocket = (userId, role, page) => {
  console.log('🔌 Connecting socket...', { userId, role, page });
  
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  // Validate required fields
  if (!userId) {
    console.warn('⚠️ Socket connect attempted without userId, skipping connection');
    return null;
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
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
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
  
  if (!sock) {
    // Socket not ready yet, retry after delay
    console.log('⏳ Socket not initialized, retrying in 500ms...');
    const timeout = setTimeout(() => {
      subscribeToOrderUpdates(callback);
    }, 500);
    return () => clearTimeout(timeout);
  }

  if (!sock.connected) {
    // Socket exists but not connected, wait for connection
    const connectHandler = () => {
      console.log('🟢 Socket connected, subscribing to order updates...');
      sock.on('order:updated', callback);
    };
    sock.once('connect', connectHandler);
    
    // Also try to subscribe immediately if connection is in progress
    const timeout = setTimeout(() => {
      if (sock.connected && !sock.hasListeners('order:updated')) {
        sock.on('order:updated', callback);
      }
    }, 1000);
    
    return () => {
      sock.off('connect', connectHandler);
      sock.off('order:updated', callback);
      clearTimeout(timeout);
    };
  }

  console.log('📡 Subscribing to order updates...');
  sock.on('order:updated', callback);
  return () => sock.off('order:updated', callback);
};

export const subscribeToPaymentUpdates = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for payment updates');
    return () => {};
  }
  
  sock.on('payment:verified', callback);
  return () => sock.off('payment:verified', callback);
};

export const subscribeToQueueUpdates = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for queue updates');
    return () => {};
  }
  
  sock.on('queue:updated', callback);
  return () => sock.off('queue:updated', callback);
};

export const subscribeToUserCount = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for user count');
    return () => {};
  }
  
  sock.on('users:count', callback);
  return () => sock.off('users:count', callback);
};

export const subscribeToStaffStatus = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for staff status');
    return () => {};
  }
  
  sock.on('staff:status', callback);
  return () => sock.off('staff:status', callback);
};

export const subscribeToUserActivity = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for user activity');
    return () => {};
  }
  
  sock.on('user:activity', callback);
  return () => sock.off('user:activity', callback);
};

export const subscribeToNotifications = (callback) => {
  const sock = getSocket();
  if (!sock) {
    console.warn('⚠️ Socket not initialized for notifications');
    return () => {};
  }
  
  sock.on('notification', callback);
  return () => sock.off('notification', callback);
};
