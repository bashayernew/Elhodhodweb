const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/messages - List user's message threads
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get unique conversations for the user
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT 
        CASE 
          WHEN m1.senderId = ${req.user.id} THEN m1.receiverId
          ELSE m1.senderId
        END as otherUserId,
        MAX(m1.createdAt) as lastMessageAt,
        COUNT(CASE WHEN m1.isRead = 0 AND m1.receiverId = ${req.user.id} THEN 1 END) as unreadCount
      FROM messages m1
      WHERE m1.senderId = ${req.user.id} OR m1.receiverId = ${req.user.id}
      GROUP BY otherUserId
      ORDER BY lastMessageAt DESC
      LIMIT ${parseInt(limit)} OFFSET ${skip}
    `;

    // Get user details and last message for each conversation
    const threads = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: conv.otherUserId },
          include: { profile: true }
        });

        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: req.user.id, receiverId: conv.otherUserId },
              { senderId: conv.otherUserId, receiverId: req.user.id }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });

        return {
          otherUser,
          lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: threads
    });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message threads'
    });
  }
});

// GET /api/messages/:threadId - Get messages in a thread
router.get('/:threadId', authenticateToken, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversation = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: threadId },
          { senderId: threadId, receiverId: req.user.id }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Get messages
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: threadId },
            { senderId: threadId, receiverId: req.user.id }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          sender: {
            include: { profile: true }
          },
          receiver: {
            include: { profile: true }
          }
        }
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: threadId },
            { senderId: threadId, receiverId: req.user.id }
          ]
        }
      })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: threadId,
        receiverId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: messages.reverse(), // Show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// POST /api/messages - Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      receiverId,
      content,
      type = 'text',
      orderId
    } = req.body;

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Validate orderId if provided
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if user is part of this order
      if (order.buyerId !== req.user.id && order.providerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to send message for this order'
        });
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content,
        type,
        orderId
      },
      include: {
        sender: {
          include: { profile: true }
        },
        receiver: {
          include: { profile: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// POST /api/messages/:id/read - Mark message as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read'
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await prisma.message.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;
