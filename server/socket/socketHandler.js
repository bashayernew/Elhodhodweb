const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join provider to their business room
    socket.on('join-provider-room', (providerId) => {
      socket.join(`provider-${providerId}`);
      console.log(`Provider ${providerId} joined their room`);
    });

    // Handle real-time messaging
    socket.on('send-message', (data) => {
      const { recipientId, message } = data;
      io.to(`user-${recipientId}`).emit('new-message', {
        senderId: socket.userId,
        message,
        timestamp: new Date()
      });
    });

    // Handle auction updates
    socket.on('join-auction', (auctionId) => {
      socket.join(`auction-${auctionId}`);
      console.log(`Socket ${socket.id} joined auction ${auctionId}`);
    });

    socket.on('leave-auction', (auctionId) => {
      socket.leave(`auction-${auctionId}`);
      console.log(`Socket ${socket.id} left auction ${auctionId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
