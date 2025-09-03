const express = require('express');
const router = express.Router();
const { requireAdmin, authenticateToken } = require('../middleware/auth');
const { seedForProvider } = require('../seed/devSeeder');

// Get pending provider verifications
router.get('/verifications', requireAdmin, async (req, res) => {
  try {
    // TODO: Implement admin verification logic
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verifications'
    });
  }
});

module.exports = router;

// Dev-only reseed endpoint (placed after exports to minimize conflict risk in demo)
router.post('/dev/reseed', authenticateToken, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ success: false });
    const providerId = req.body?.providerId || req.user.id;
    await seedForProvider(providerId);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Reseed failed' });
  }
});
