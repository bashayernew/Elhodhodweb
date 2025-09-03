const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/favorites - List user's favorites
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      userId: req.user.id,
      ...(type && { type })
    };

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          // Include item details based on type
          // Note: We'll need to handle this differently since we can't include multiple models
        }
      }),
      prisma.favorite.count({ where })
    ]);

    // Get detailed information for each favorite
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        let itemDetails = null;
        
        if (favorite.type === 'service') {
          itemDetails = await prisma.service.findUnique({
            where: { id: favorite.itemId },
            include: {
              provider: {
                include: { profile: true }
              }
            }
          });
        } else if (favorite.type === 'product') {
          itemDetails = await prisma.product.findUnique({
            where: { id: favorite.itemId },
            include: {
              provider: {
                include: { profile: true }
              }
            }
          });
        } else if (favorite.type === 'auction') {
          itemDetails = await prisma.auction.findUnique({
            where: { id: favorite.itemId },
            include: {
              provider: {
                include: { profile: true }
              }
            }
          });
        }

        return {
          ...favorite,
          item: itemDetails
        };
      })
    );

    res.json({
      success: true,
      data: favoritesWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

// POST /api/favorites - Add item to favorites
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, itemId } = req.body;

    // Validate item exists
    let itemExists = false;
    if (type === 'service') {
      const service = await prisma.service.findUnique({
        where: { id: itemId }
      });
      itemExists = !!service;
    } else if (type === 'product') {
      const product = await prisma.product.findUnique({
        where: { id: itemId }
      });
      itemExists = !!product;
    } else if (type === 'auction') {
      const auction = await prisma.auction.findUnique({
        where: { id: itemId }
      });
      itemExists = !!auction;
    }

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        type,
        itemId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Item is already in favorites'
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        type,
        itemId
      }
    });

    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites'
    });
  }
});

// DELETE /api/favorites/:id - Remove item from favorites
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { id }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    if (favorite.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this favorite'
      });
    }

    await prisma.favorite.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Item removed from favorites successfully'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites'
    });
  }
});

// DELETE /api/favorites - Remove item from favorites by type and itemId
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { type, itemId } = req.query;

    if (!type || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Type and itemId are required'
      });
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        type,
        itemId
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    res.json({
      success: true,
      message: 'Item removed from favorites successfully'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites'
    });
  }
});

// GET /api/favorites/check - Check if item is favorited
router.get('/check', authenticateToken, async (req, res) => {
  try {
    const { type, itemId } = req.query;

    if (!type || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Type and itemId are required'
      });
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.user.id,
        type,
        itemId
      }
    });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite?.id || null
      }
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status'
    });
  }
});

module.exports = router;
