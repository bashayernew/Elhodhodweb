const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, pendingGuard } = require('../middleware/auth');
const router = express.Router();

// GET /api/services - List services with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      governorate,
      area,
      minPrice,
      maxPrice,
      rating,
      q,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {
      isActive: true,
      ...(category && { category }),
      ...(subcategory && { subcategory }),
      ...(governorate && { governorate }),
      ...(area && { area }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(rating && { rating: { gte: parseFloat(rating) } }),
      ...(q && q.trim() && {
        OR: [
          { title: { contains: q.trim(), mode: 'insensitive' } },
          { description: { contains: q.trim(), mode: 'insensitive' } }
        ]
      })
    };

    // Build orderBy clause
    let orderBy = {};
    switch (sort) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          provider: {
            include: {
              profile: true,
              // Include provider meta for verification status
              provider: true
            }
          }
        }
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Company provider: CRUD under /api/provider/services
router.get('/provider/services', authenticateToken, async (req, res) => {
  try {
    const list = await prisma.service.findMany({ where: { providerId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch provider services' });
  }
});

router.post('/provider/services', authenticateToken, async (req, res) => {
  try {
    const {
      title, description, category, subcategory,
      pricingModel, price, leadTime, areas, status
    } = req.body;
    const created = await prisma.service.create({
      data: {
        title,
        description,
        category,
        subcategory,
        pricingModel: pricingModel || 'fixed',
        price: price ? parseFloat(price) : 0,
        leadTime,
        coverageAreas: areas || '',
        status: status || 'draft',
        providerId: req.user.id,
        isActive: status === 'active'
      }
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

router.put('/provider/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    const updateData = { ...req.body };
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.status) updateData.isActive = updateData.status === 'active';
    const updated = await prisma.service.update({ where: { id }, data: updateData });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

router.delete('/provider/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

// GET /api/services/:id - Get service details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            profile: true,
            provider: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
});

// POST /api/services - Create new service (providers only)
router.post('/', authenticateToken, pendingGuard, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      price,
      governorate,
      area,
      latitude,
      longitude
    } = req.body;

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        subcategory,
        price: parseFloat(price),
        governorate,
        area,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        providerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
});

// PUT /api/services/:id - Update service (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the service
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
});

// DELETE /api/services/:id - Delete service (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the service
    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    if (service.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
});

module.exports = router;
