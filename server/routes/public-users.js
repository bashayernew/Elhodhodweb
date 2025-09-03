const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');

// GET /api/public/users/:id - public user profile (safe subset)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, provider: true },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Expose only non-sensitive fields
    const data = {
      id: user.id,
      role: user.role,
      firstName: user.profile?.firstName || null,
      lastName: user.profile?.lastName || null,
      avatar: user.profile?.avatarUrl || null,
      bio: user.profile?.bio || '',
      governorate: user.profile?.governorate || null,
      area: user.profile?.area || null,
      provider: user.role === 'provider' ? {
        brandName: user.provider?.brandName || null,
        verificationStatus: user.provider?.verificationStatus || null,
        categories: (() => { try { return JSON.parse(user.provider?.categories || '[]'); } catch { return []; } })(),
      } : undefined,
    };
    return res.json({ success: true, data });
  } catch (e) {
    console.error('Public user profile error:', e);
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

module.exports = router;


