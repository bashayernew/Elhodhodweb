const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../config/database');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const rows = await prisma.customerProfile.findMany({ where: { providerId: req.user.id }, orderBy: { createdAt: 'desc' } });
    const data = rows.map((r) => ({ id: r.id, name: r.name, orders: r.orders, rating: r.rating, segments: r.segments ? JSON.parse(r.segments) : [] }));
    res.json({ success: true, data });
  } catch (e) {
    console.error('customers list error', e);
    res.status(500).json({ success: true, data: [] });
  }
});

module.exports = router;


