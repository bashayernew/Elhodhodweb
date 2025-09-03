const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Public: list categories with subcategories
router.get('/', async (req, res) => {
  try {
    const items = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
    res.json({ success: true, data: items });
  } catch (e) {
    console.error('List categories error', e);
    res.status(500).json({ success: false, message: 'Failed to load categories' });
  }
});

// Admin: create category
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { slug, nameEn, nameAr, sortOrder = 0, isActive = true } = req.body;
    const cat = await prisma.category.create({ data: { slug, nameEn, nameAr, sortOrder, isActive } });
    res.status(201).json({ success: true, data: cat });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: update category
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const cat = await prisma.category.update({ where: { id }, data });
    res.json({ success: true, data: cat });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: delete category
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subcategory.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: add subcategory
router.post('/:categoryId/subcategories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { slug, nameEn, nameAr, sortOrder = 0, isActive = true } = req.body;
    const sub = await prisma.subcategory.create({ data: { categoryId, slug, nameEn, nameAr, sortOrder, isActive } });
    res.status(201).json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: update subcategory
router.put('/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const sub = await prisma.subcategory.update({ where: { id }, data });
    res.json({ success: true, data: sub });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Admin: delete subcategory
router.delete('/subcategories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subcategory.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;


