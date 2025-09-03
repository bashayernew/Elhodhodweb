const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../config/database');

// GET /api/calendar?weekStart=YYYY-MM-DD
router.get('/', authenticateToken, async (req, res) => {
  try {
    const events = await prisma.calendarEvent.findMany({
      where: { providerId: req.user.id },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    res.json({ success: true, data: events });
  } catch (e) {
    console.error('calendar list error', e);
    res.status(500).json({ success: true, data: [] });
  }
});

// POST /api/calendar
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, title, date, time, technician, branch } = req.body;
    const created = await prisma.calendarEvent.create({
      data: {
        id: id || undefined,
        providerId: req.user.id,
        title: title || 'Job',
        date,
        time,
        technician: technician || null,
        branch: branch || null,
      },
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error('calendar create error', e);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// PUT /api/calendar/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    const updated = await prisma.calendarEvent.update({ where: { id }, data: req.body });
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('calendar update error', e);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
});

// DELETE /api/calendar/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user.id) return res.status(404).json({ success: false, message: 'Not found' });
    await prisma.calendarEvent.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    console.error('calendar delete error', e);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
});

module.exports = router;


