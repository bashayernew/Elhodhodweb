const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// GET /api/quotes - list RFQs for provider
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = req.user.role === 'provider' ? { providerId: req.user.id } : { buyerId: req.user.id };
    const quotes = await prisma.quoteRequest.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: quotes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
});

// PUT /api/quotes/:id/respond - provider sends a quote
router.put('/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { price, terms, expiresAt } = req.body;
    const reqq = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!reqq || reqq.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = await prisma.quoteRequest.update({ where: { id }, data: { responsePrice: parseFloat(price), responseTerms: terms, responseExpiresAt: expiresAt ? new Date(expiresAt) : null, status: 'responded' } });
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to send quote' });
  }
});

module.exports = router;


