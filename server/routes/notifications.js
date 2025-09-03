const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
const webpush = require('web-push');
const fetch = require('node-fetch');

// GET /api/notifications - List user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      cursor,
      limit = 20,
      unreadOnly = false
    } = req.query;

    const where = {
      userId: req.user.id,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      ...(cursor && { cursor: { id: cursor } }),
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      hasMore: notifications.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Web Push setup (VAPID)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@hodhod.local',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

// POST /api/notifications/push/subscribe - Save browser push subscription
router.post('/push/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Invalid subscription' });
    }
    // Persist subscription to DB (per user). Using Prisma JSON field if exists; fallback to simple table
    await prisma.user.update({
      where: { id: req.user.id },
      data: { pushSubscription: subscription }
    }).catch(async () => {
      // If schema lacks field, create a generic table
      await prisma.pushSubscription.upsert({
        where: { userId: req.user.id },
        update: { data: subscription },
        create: { userId: req.user.id, data: subscription }
      });
    });
    res.json({ success: true });
  } catch (e) {
    console.error('subscribe error', e);
    res.status(500).json({ success: false, message: 'Failed to save subscription' });
  }
});

// POST /api/notifications/push/test - Send a test notification
router.post('/push/test', authenticateToken, async (req, res) => {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return res.status(400).json({ success: false, message: 'VAPID keys not set' });
    }
    // Load user subscription
    let subscriptionRecord = null;
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { pushSubscription: true } });
      subscriptionRecord = user?.pushSubscription || null;
    } catch (_) {
      subscriptionRecord = await prisma.pushSubscription.findUnique({ where: { userId: req.user.id } });
      subscriptionRecord = subscriptionRecord?.data || null;
    }
    if (!subscriptionRecord) return res.status(404).json({ success: false, message: 'No subscription found' });

    await webpush.sendNotification(subscriptionRecord, JSON.stringify({
      title: 'HodHod',
      body: 'This is a test notification',
      data: { url: '/' }
    }));
    res.json({ success: true });
  } catch (e) {
    console.error('push test error', e);
    res.status(500).json({ success: false, message: 'Failed to send test push' });
  }
});

// WhatsApp integration (Meta Cloud API)
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WA_TEMPLATE = process.env.WHATSAPP_TEMPLATE_NAME || '';

async function sendWhatsAppTemplate(toPhone, title, bodyUrl) {
  if (!WA_TOKEN || !WA_PHONE_NUMBER_ID) throw new Error('WhatsApp credentials missing');
  const url = `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`;
  const payload = WA_TEMPLATE
    ? {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'template',
        template: {
          name: WA_TEMPLATE,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [{ type: 'text', text: title || 'HodHod' }]
            }
          ]
        }
      }
    : {
        messaging_product: 'whatsapp',
        to: toPhone,
        type: 'text',
        text: { preview_url: !!bodyUrl, body: title || 'HodHod notification' }
      };
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`WhatsApp send failed: ${resp.status} ${txt}`);
  }
}

// POST /api/notifications/whatsapp/opt-in
router.post('/whatsapp/opt-in', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required (E.164 format, e.g. +965...)' });

    // Try to persist on user model
    let saved = false;
    try {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { whatsappNumber: phone, whatsappOptIn: true }
      });
      saved = true;
    } catch (_) {
      // Fallback to dedicated table
      try {
        await prisma.whatsappSubscription.upsert({
          where: { userId: req.user.id },
          update: { phone, optedIn: true },
          create: { userId: req.user.id, phone, optedIn: true }
        });
        saved = true;
      } catch (_) {}
    }

    // Send welcome/test message
    try {
      await sendWhatsAppTemplate(phone, 'You have enabled WhatsApp notifications on HodHod.', '/');
    } catch (e) {
      console.error('WhatsApp welcome error', e.message);
    }

    res.json({ success: true, saved });
  } catch (e) {
    console.error('whatsapp opt-in error', e);
    res.status(500).json({ success: false, message: 'Failed to enable WhatsApp notifications' });
  }
});

// POST /api/notifications/whatsapp/test
router.post('/whatsapp/test', authenticateToken, async (req, res) => {
  try {
    const { phone } = req.body;
    let target = phone;
    if (!target) {
      try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { whatsappNumber: true } });
        target = user?.whatsappNumber || null;
      } catch (_) {
        const sub = await prisma.whatsappSubscription.findUnique({ where: { userId: req.user.id } });
        target = sub?.phone || null;
      }
    }
    if (!target) return res.status(404).json({ success: false, message: 'No WhatsApp number on file' });
    await sendWhatsAppTemplate(target, 'Test notification from HodHod');
    res.json({ success: true });
  } catch (e) {
    console.error('whatsapp test error', e);
    res.status(500).json({ success: false, message: 'Failed to send WhatsApp test' });
  }
});

// POST /api/notifications/:id/read - Mark notification as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this notification as read'
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// POST /api/notifications - Create notification (admin/system use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      body,
      deepLink
    } = req.body;

    // Only admins can create notifications for other users
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create notifications for other users'
      });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        deepLink
      }
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

module.exports = router;

