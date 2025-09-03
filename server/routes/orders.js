const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/orders - List user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      type,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause based on user role
    let where = {};
    if (req.user.role === 'provider') {
      where.providerId = req.user.id;
    } else {
      where.buyerId = req.user.id;
    }

    // Add status filter
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          buyer: {
            include: { profile: true }
          },
          provider: {
            include: { profile: true }
          },
          items: {
            include: {
              service: true,
              product: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    // Filter by type if specified
    let filteredOrders = orders;
    if (type) {
      filteredOrders = orders.filter(order => {
        return order.items.some(item => item.type === type);
      });
    }

    res.json({
      success: true,
      data: filteredOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: {
          include: { profile: true }
        },
        provider: {
          include: { profile: true }
        },
        items: {
          include: {
            service: true,
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    if (order.buyerId !== req.user.id && order.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
});

// POST /api/orders - Create new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      providerId,
      items,
      governorate,
      area,
      street,
      building,
      floor,
      apartment,
      notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (item.type === 'product') {
        const product = await prisma.product.findUnique({
          where: { id: item.itemId }
        });

        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Product ${item.itemId} not found`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`
          });
        }

        const lineTotal = product.price * item.quantity;
        totalAmount += lineTotal;

        orderItems.push({
          type: 'product',
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: lineTotal
        });

        // Update stock
        await prisma.product.update({
          where: { id: item.itemId },
          data: { stock: product.stock - item.quantity }
        });
      } else if (item.type === 'service') {
        const service = await prisma.service.findUnique({
          where: { id: item.itemId }
        });

        if (!service) {
          return res.status(400).json({
            success: false,
            message: `Service ${item.itemId} not found`
          });
        }

        const lineTotal = service.price * item.quantity;
        totalAmount += lineTotal;

        orderItems.push({
          type: 'service',
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: service.price,
          totalPrice: lineTotal
        });
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId: req.user.id,
        providerId,
        totalAmount,
        governorate,
        area,
        street,
        building,
        floor,
        apartment,
        notes
      }
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          buyerId: req.user.id,
          ...item
        }
      });
    }

    // Clear cart for products
    await prisma.cartItem.deleteMany({
      where: {
        userId: req.user.id,
        productId: {
          in: items.filter(item => item.type === 'product').map(item => item.itemId)
        }
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only provider can update status
    if (order.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order status'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only buyer can cancel order
    if (order.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    // Calculate refund amount based on status
    let refundAmount = order.totalAmount;
    let refundReason = reason;

    if (order.status === 'requested' || order.status === 'in_chat') {
      refundAmount = order.totalAmount - 1.000; // Gateway fee
      refundReason = `${reason} - Gateway fee (1.000 KWD) applied`;
    } else if (order.status === 'in_progress') {
      refundAmount = order.totalAmount - 1.250; // Gateway + supplier compensation
      refundReason = `${reason} - Gateway fee (1.000 KWD) + Supplier compensation (0.250 KWD) applied`;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        refundAmount,
        refundReason
      }
    });

    // Restore product stock if applicable
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: id, type: 'product' }
    });

    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.itemId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      });
    }

    res.json({
      success: true,
      data: updatedOrder,
      refundAmount,
      refundReason
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;
