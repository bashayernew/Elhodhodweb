const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../config/database');

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({ where: { providerId: req.user.id }, orderBy: { date: 'desc' } });
    // Balance placeholder: sum of paid payouts for demo
    const balance = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    res.json({ success: true, data: { balance, payouts } });
  } catch (e) {
    console.error('finance summary error', e);
    res.status(500).json({ success: true, data: { balance: 0, payouts: [] } });
  }
});

module.exports = router;


