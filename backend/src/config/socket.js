const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Store online users and staff
const onlineUsers = new Map(); // Map<socketId, userData>
const onlineStaff = new Map(); // Map<socketId, staffData>

// Track user activity
const userActivity = new Map(); // Map<userId, { page, lastSeen }>

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:9001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    // Join room based on user ID or role
    socket.on('join', (data) => {
      const { userId, role, page } = data;
      
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      
      if (page) {
        socket.join(`page:${page}`);
      }

      // Track user activity
      if (userId) {
        userActivity.set(userId, { page, lastSeen: new Date() });
      }

      // Track online users
      onlineUsers.set(socket.id, { userId, role, page });

      // If staff, track separately
      if (['admin', 'kitchen', 'driver'].includes(role)) {
        onlineStaff.set(socket.id, { userId, role, department: getDepartment(role) });
        io.emit('staff:status', getStaffStatus());
      }

      // Broadcast updated counts
      io.emit('users:count', {
        total: onlineUsers.size,
        staff: onlineStaff.size,
      });

      console.log(`📊 User ${userId} (${role}) joined from ${page || 'unknown'}`);
    });

    // Page change
    socket.on('page:change', (data) => {
      const { userId, page } = data;
      
      if (userId) {
        userActivity.set(userId, { page, lastSeen: new Date() });
      }

      const userData = onlineUsers.get(socket.id);
      if (userData) {
        userData.page = page;
        onlineUsers.set(socket.id, userData);
      }

      io.emit('user:activity', { userId, page, timestamp: new Date() });
    });

    // Staff status update (online/offline/busy)
    socket.on('staff:status:update', (data) => {
      const { userId, status, department } = data;
      
      const staffData = onlineStaff.get(socket.id);
      if (staffData) {
        staffData.status = status;
        staffData.department = department;
        onlineStaff.set(socket.id, staffData);
        io.emit('staff:status', getStaffStatus());
      }
    });

    // Order updates
    socket.on('order:update', (data) => {
      const { orderId, status, queueNumber } = data;
      io.emit('order:updated', data);
      
      // Notify specific user
      if (data.userId) {
        io.to(`user:${data.userId}`).emit('order:status', {
          orderId,
          status,
          queueNumber,
          timestamp: new Date(),
        });
      }
    });

    // Queue updates
    socket.on('queue:update', (data) => {
      const { queueNumber, status, estimatedTime } = data;
      io.emit('queue:updated', data);
    });

    // Payment verification
    socket.on('payment:verify', (data) => {
      const { orderId, status } = data;
      io.emit('payment:verified', { orderId, status, timestamp: new Date() });
    });

    // Push notification trigger
    socket.on('notification:send', (data) => {
      const { userId, title, body } = data;
      io.to(`user:${userId}`).emit('notification', { title, body });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const userData = onlineUsers.get(socket.id);
      
      if (userData) {
        onlineUsers.delete(socket.id);
        
        if (userData.userId) {
          userActivity.delete(userData.userId);
        }

        // If staff was online, update
        if (onlineStaff.has(socket.id)) {
          onlineStaff.delete(socket.id);
          io.emit('staff:status', getStaffStatus());
        }
      }

      // Broadcast updated counts
      io.emit('users:count', {
        total: onlineUsers.size,
        staff: onlineStaff.size,
      });

      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper: Get department from role
const getDepartment = (role) => {
  const departments = {
    admin: 'Admin',
    kitchen: 'Dapur',
    driver: 'Delivery',
  };
  return departments[role] || 'CS';
};

// Helper: Get staff status for broadcasting
const getStaffStatus = () => {
  const status = {
    Dapur: [],
    Delivery: [],
    CS: [],
    Admin: [],
  };

  onlineStaff.forEach((staff) => {
    const dept = staff.department || getDepartment(staff.role);
    if (status[dept]) {
      status[dept].push({
        userId: staff.userId,
        role: staff.role,
        status: staff.status || 'online',
      });
    }
  });

  return status;
};

// Helper: Get IO instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper: Get online users count
const getOnlineUsers = () => onlineUsers.size;

// Helper: Get user activity
const getUserActivity = () => {
  const activity = [];
  userActivity.forEach((data, userId) => {
    activity.push({ userId, ...data });
  });
  return activity;
};

module.exports = {
  initializeSocket,
  getIO,
  getOnlineUsers,
  getUserActivity,
};
