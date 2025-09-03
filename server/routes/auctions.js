const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, pendingGuard } = require('../middleware/auth');
const router = express.Router();

// GET /api/auctions - List auctions with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      governorate,
      area,
      minPrice,
      maxPrice,
      status = 'active',
      sort = 'ending_soon',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      status,
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(governorate && { governorate }),
      ...(area && { area }),
      ...(minPrice && { currentPrice: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { currentPrice: { lte: parseFloat(maxPrice) } })
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sort) {
      case 'ending_soon':
        orderBy = { endTime: 'asc' };
        break;
      case 'most_bids':
        orderBy = { 
          bids: {
            _count: 'desc'
          }
        };
        break;
      case 'highest_price':
        orderBy = { currentPrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { endTime: 'asc' };
        break;
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          provider: {
            include: {
              profile: true
            }
          },
          _count: {
            select: {
              bids: true
            }
          }
        }
      }),
      prisma.auction.count({ where })
    ]);

    res.json({
      success: true,
      data: auctions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auctions'
    });
  }
});

// Company provider: CRUD subset under /api/provider/auctions
router.get('/provider/auctions', authenticateToken, async (req, res) => {
  try {
    const list = await prisma.auction.findMany({ where: { providerId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch provider auctions' });
  }
});

router.post('/provider/auctions', authenticateToken, async (req, res) => {
  try {
    const { title, description, startPrice, minIncrement, reservePrice, buyNowPrice, startsAt, endsAt } = req.body;
    const created = await prisma.auction.create({
      data: {
        title, description,
        startPrice: parseFloat(startPrice || 0),
        currentPrice: parseFloat(startPrice || 0),
        minIncrement: parseFloat(minIncrement || 1),
        reservePrice: reservePrice ? parseFloat(reservePrice) : null,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
        startTime: startsAt ? new Date(startsAt) : new Date(),
        endTime: endsAt ? new Date(endsAt) : new Date(Date.now() + 86400000),
        status: 'active',
        providerId: req.user.id
      }
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create auction' });
  }
});

router.delete('/provider/auctions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.auction.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    await prisma.auction.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete auction' });
  }
});

// GET /api/auctions/:id - Get auction details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            profile: true
          }
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 10,
          include: {
            bidder: {
              include: {
                profile: true
              }
            }
          }
        },
        _count: {
          select: {
            bids: true
          }
        }
      }
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auction'
    });
  }
});

// POST /api/auctions - Create new auction (providers only)
router.post('/', authenticateToken, pendingGuard, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      startPrice,
      minIncrement,
      reservePrice,
      buyNowPrice,
      startTime,
      endTime,
      antiSniping,
      governorate,
      area,
      latitude,
      longitude
    } = req.body;

    const auction = await prisma.auction.create({
      data: {
        title,
        description,
        category,
        subcategory,
        startPrice: parseFloat(startPrice),
        currentPrice: parseFloat(startPrice),
        minIncrement: parseFloat(minIncrement),
        reservePrice: reservePrice ? parseFloat(reservePrice) : null,
        buyNowPrice: buyNowPrice ? parseFloat(buyNowPrice) : null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        antiSniping: antiSniping || false,
        governorate,
        area,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        providerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: auction
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create auction'
    });
  }
});

// POST /api/auctions/:id/bids - Place bid
router.post('/:id/bids', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, isProxy = false, maxAmount } = req.body;

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Auction is not active'
      });
    }

    if (new Date() > auction.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Auction has ended'
      });
    }

    // Check if user is not the auction owner
    if (auction.providerId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot bid on your own auction'
      });
    }

    // Get current highest bid
    const currentHighestBid = auction.bids[0];
    const minBidAmount = currentHighestBid 
      ? currentHighestBid.amount + auction.minIncrement
      : auction.startPrice;

    if (amount < minBidAmount) {
      return res.status(400).json({
        success: false,
        message: `Bid must be at least ${minBidAmount} KWD`
      });
    }

    // Check reserve price
    if (auction.reservePrice && amount < auction.reservePrice) {
      return res.status(400).json({
        success: false,
        message: `Bid must meet reserve price of ${auction.reservePrice} KWD`
      });
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        auctionId: id,
        bidderId: req.user.id,
        amount: parseFloat(amount),
        isProxy,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null
      }
    });

    // Update auction current price
    await prisma.auction.update({
      where: { id },
      data: { currentPrice: parseFloat(amount) }
    });

    // Check if anti-sniping should extend auction
    if (auction.antiSniping && new Date() > new Date(auction.endTime.getTime() - 5 * 60 * 1000)) {
      // Extend auction by 5 minutes if bid placed in last 5 minutes
      await prisma.auction.update({
        where: { id },
        data: { 
          endTime: new Date(auction.endTime.getTime() + 5 * 60 * 1000)
        }
      });
    }

    // Check if buy-now price is met
    if (auction.buyNowPrice && amount >= auction.buyNowPrice) {
      await prisma.auction.update({
        where: { id },
        data: { 
          status: 'ended',
          endTime: new Date()
        }
      });
    }

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bid'
    });
  }
});

// GET /api/auctions/:id/bids - Get auction bids
router.get('/:id/bids', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where: { auctionId: id },
        orderBy: { amount: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          bidder: {
            include: {
              profile: true
            }
          }
        }
      }),
      prisma.bid.count({
        where: { auctionId: id }
      })
    ]);

    res.json({
      success: true,
      data: bids,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching auction bids:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch auction bids'
    });
  }
});

// PUT /api/auctions/:id - Update auction (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const auction = await prisma.auction.findUnique({
      where: { id }
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this auction'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update ended auction'
      });
    }

    const updatedAuction = await prisma.auction.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedAuction
    });
  } catch (error) {
    console.error('Error updating auction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update auction'
    });
  }
});

// DELETE /api/auctions/:id - Delete auction (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await prisma.auction.findUnique({
      where: { id }
    });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    if (auction.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this auction'
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ended auction'
      });
    }

    await prisma.auction.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Auction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting auction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete auction'
    });
  }
});

module.exports = router;
