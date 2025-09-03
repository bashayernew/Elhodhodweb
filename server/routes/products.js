const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, pendingGuard } = require('../middleware/auth');
const router = express.Router();

// GET /api/products - List products with filters
router.get('/', async (req, res) => {
  try {
    const {
      category,
      subcategory,
      governorate,
      area,
      condition,
      minPrice,
      maxPrice,
      rating,
      inStock,
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
      ...(condition && { condition }),
      ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
      ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
      ...(rating && { rating: { gte: parseFloat(rating) } }),
      ...(inStock === 'true' && { stock: { gt: 0 } })
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: {
          provider: {
            include: {
              profile: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Company provider: CRUD under /api/provider/products
router.get('/provider/products', authenticateToken, async (req, res) => {
  try {
    const list = await prisma.product.findMany({ where: { providerId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch provider products' });
  }
});

router.post('/provider/products', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, subcategory, price, originalPrice, condition, stock, status } = req.body;
    const created = await prisma.product.create({
      data: {
        name,
        description,
        category,
        subcategory,
        price: price ? parseFloat(price) : 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        condition,
        stock: stock ? parseInt(stock) : 0,
        status: status || 'draft',
        isActive: status === 'active',
        providerId: req.user.id
      }
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

router.put('/provider/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.originalPrice) data.originalPrice = parseFloat(data.originalPrice);
    if (data.stock) data.stock = parseInt(data.stock);
    if (data.status) data.isActive = data.status === 'active';
    const updated = await prisma.product.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

router.delete('/provider/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// GET /api/products/:id - Get product details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            profile: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// POST /api/products - Create new product (providers only)
router.post('/', authenticateToken, pendingGuard, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subcategory,
      price,
      originalPrice,
      condition,
      stock,
      governorate,
      area,
      latitude,
      longitude
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        subcategory,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        condition,
        stock: parseInt(stock),
        governorate,
        area,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        providerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// PUT /api/products/:id - Update product (owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the product
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// DELETE /api/products/:id - Delete product (owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the product
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.providerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Cart routes
// GET /api/products/cart - Get user's cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            provider: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// POST /api/products/cart - Add item to cart
router.post('/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: req.user.id,
        productId
      }
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity
        }
      });
    }

    res.status(201).json({
      success: true,
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to cart'
    });
  }
});

// PUT /api/products/cart/:id - Update cart item quantity
router.put('/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this cart item'
      });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item'
    });
  }
});

// DELETE /api/products/cart/:id - Remove item from cart
router.delete('/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this cart item'
      });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cart item removed successfully'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item'
    });
  }
});

module.exports = router;
