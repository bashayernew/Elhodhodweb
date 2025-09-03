const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/post-requests - List post requests with filters
router.get('/', async (req, res) => {
  try {
    const {
      type,
      category,
      subcategory,
      governorate,
      area,
      status = 'active',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      status,
      ...(type && { type }),
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(governorate && { governorate }),
      ...(area && { area })
    };

    const [postRequests, total] = await Promise.all([
      prisma.postRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          buyer: {
            include: { profile: true }
          }
        }
      }),
      prisma.postRequest.count({ where })
    ]);

    res.json({
      success: true,
      data: postRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching post requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post requests'
    });
  }
});

// GET /api/post-requests/my - List current user's post requests
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      buyerId: req.user.id,
      ...(status && { status })
    };
    const [items, total] = await Promise.all([
      prisma.postRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.postRequest.count({ where })
    ]);
    res.json({ success: true, data: items, total });
  } catch (e) {
    console.error('Error fetching my post requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch your post requests' });
  }
});

// GET /api/post-requests/:id - Get post request details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const postRequest = await prisma.postRequest.findUnique({
      where: { id },
      include: {
        buyer: {
          include: { profile: true }
        }
      }
    });

    if (!postRequest) {
      return res.status(404).json({
        success: false,
        message: 'Post request not found'
      });
    }

    res.json({
      success: true,
      data: postRequest
    });
  } catch (error) {
    console.error('Error fetching post request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post request'
    });
  }
});

// POST /api/post-requests - Create new post request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      category,
      subcategory,
      description,
      governorate,
      area,
      latitude,
      longitude,
      isPremium = false
    } = req.body;

    // Set expiration date (30 days for regular, 60 days for premium)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (isPremium ? 60 : 30));

    const postRequest = await prisma.postRequest.create({
      data: {
        type,
        category,
        subcategory,
        description,
        governorate,
        area,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isPremium,
        expiresAt,
        buyerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: postRequest
    });
  } catch (error) {
    console.error('Error creating post request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post request'
    });
  }
});

// PUT /api/post-requests/:id - Update post request (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const postRequest = await prisma.postRequest.findUnique({
      where: { id }
    });

    if (!postRequest) {
      return res.status(404).json({
        success: false,
        message: 'Post request not found'
      });
    }

    if (postRequest.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post request'
      });
    }

    if (postRequest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update closed or expired post request'
      });
    }

    const updatedPostRequest = await prisma.postRequest.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedPostRequest
    });
  } catch (error) {
    console.error('Error updating post request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post request'
    });
  }
});

// DELETE /api/post-requests/:id - Delete post request (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const postRequest = await prisma.postRequest.findUnique({
      where: { id }
    });

    if (!postRequest) {
      return res.status(404).json({
        success: false,
        message: 'Post request not found'
      });
    }

    if (postRequest.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post request'
      });
    }

    await prisma.postRequest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Post request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post request'
    });
  }
});

// POST /api/post-requests/:id/close - Close post request
router.post('/:id/close', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const postRequest = await prisma.postRequest.findUnique({
      where: { id }
    });

    if (!postRequest) {
      return res.status(404).json({
        success: false,
        message: 'Post request not found'
      });
    }

    if (postRequest.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this post request'
      });
    }

    if (postRequest.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Post request is already closed or expired'
      });
    }

    const updatedPostRequest = await prisma.postRequest.update({
      where: { id },
      data: { status: 'closed' }
    });

    res.json({
      success: true,
      data: updatedPostRequest
    });
  } catch (error) {
    console.error('Error closing post request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close post request'
    });
  }
});

module.exports = router;
