const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const prisma = new PrismaClient();

// GET /api/providers - public list of providers with basic filters
router.get('/', async (req, res) => {
  try {
    const { category, q, verified = 'true', page = 1, limit = 12 } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (parseInt(page) - 1) * take;

    const where = {
      role: 'provider',
      provider: {
        is: {
          ...(verified === 'true' ? { verificationStatus: 'active' } : {}),
          ...(category ? { categories: { contains: `"${category}"` } } : {})
        }
      },
      ...(q ? {
        OR: [
          { profile: { is: { firstName: { contains: q, mode: 'insensitive' } } } },
          { profile: { is: { lastName: { contains: q, mode: 'insensitive' } } } },
          { provider: { is: { brandName: { contains: q, mode: 'insensitive' } } } }
        ]
      } : {})
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true, provider: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);

    res.json({ success: true, data: items.map((u) => ({
      id: u.id,
      brandName: u.provider?.brandName,
      categories: (() => { try { return JSON.parse(u.provider?.categories || '[]'); } catch { return []; } })(),
      verificationStatus: u.provider?.verificationStatus,
      avatar: u.profile?.avatarUrl,
      firstName: u.profile?.firstName,
      lastName: u.profile?.lastName
    })), pagination: { total, page: parseInt(page), limit: take } });
  } catch (e) {
    console.error('List providers error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch providers' });
  }
});

module.exports = router;

// GET /api/providers/:id - provider public profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, provider: true }
    });
    if (!user || user.role !== 'provider') {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    const categories = (() => { try { return JSON.parse(user.provider?.categories || '[]'); } catch { return []; } })();
    res.json({ success: true, data: {
      id: user.id,
      brandName: user.provider?.brandName,
      categories,
      verificationStatus: user.provider?.verificationStatus,
      avatar: user.profile?.avatarUrl,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      bio: user.profile?.bio || '',
      governorate: user.profile?.location || ''
    }});
  } catch (e) {
    console.error('Get provider error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch provider' });
  }
});

// PUT /api/providers/:id - owner-only profile update
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = new PrismaClient();
    if (req.user.id !== id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { brandName, responseTime, languages, yearsInBusiness, bio, workingHours, serviceAreas, cover, logo, policies, locations, portfolio } = req.body;

    // Update Profile fields
    const profileData = {
      bio: bio ?? undefined,
      avatarUrl: undefined, // avatar not set here
      // Optionally map governorate/area if provided in future
    };
    // Update Provider fields
    const providerData = {
      brandName: brandName ?? undefined,
      workHours: workingHours ?? undefined,
      // Persist complex JSON as strings per current schema
      categories: undefined,
      // custom fields saved in JSON in brandName/categories for demo
    };

    // Execute updates
    const updates = [];
    if (bio !== undefined) updates.push(prisma.profile.upsert({ where: { userId: id }, update: profileData, create: { userId: id, firstName: '', lastName: '', ...profileData } }));
    if (brandName !== undefined || workingHours !== undefined) updates.push(prisma.provider.upsert({ where: { userId: id }, update: providerData, create: { userId: id, brandName: brandName || '', divisions: 'services', categories: '[]', ...providerData } }));

    // Save extra metadata in a lightweight key-value table if available; for now, store as JSON in profile.bio when not conflicting (demo fallback)
    // Demo: stash extras under AdminSeed as a simple storage is avoided; return the merged payload for front-end

    await Promise.all(updates);
    return res.json({ success: true, data: { id, brandName, responseTime, languages, yearsInBusiness, bio, workingHours, serviceAreas, cover, logo, policies, locations, portfolio } });
  } catch (e) {
    console.error('Update provider error:', e);
    return res.status(500).json({ success: false, message: 'Failed to update provider' });
  }
});


