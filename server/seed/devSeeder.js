const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function seedCalendar(providerId) {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);

  const entries = [
    { title: 'AC Maintenance - Khaitan',  dayOffset: 0, time: '09:00', tech: 'Ali', branch: 'Farwaniya' },
    { title: 'Site Survey - Salmiya',     dayOffset: 1, time: '11:00', tech: 'Sara', branch: 'Hawalli' },
    { title: 'Install Split Unit',        dayOffset: 2, time: '14:00', tech: 'Omar', branch: 'Capital' },
    { title: 'Delivery - Filters',        dayOffset: 3, time: '10:30', tech: 'Hadi', branch: 'Farwaniya' },
    { title: 'Emergency Callout',         dayOffset: 4, time: '16:00', tech: 'Team A', branch: 'Capital' },
  ];

  const data = entries.map((e) => ({
    providerId,
    title: e.title,
    date: formatDate(new Date(monday.getTime() + e.dayOffset * 86400000)),
    time: e.time,
    technician: e.tech,
    branch: e.branch,
  }));
  await prisma.calendarEvent.createMany({ data, skipDuplicates: true });
}

async function seedCustomers(providerId) {
  const names = ['Mohammed', 'Fatima', 'Abdullah', 'Mariam', 'Yousef', 'Noura', 'Hamad', 'Layla', 'Salem', 'Hessa'];
  const segments = [['repeat'], ['high_value'], ['new'], ['issue_history'], ['vip']];
  const data = names.map((n, i) => ({
    providerId,
    name: n,
    orders: Math.floor(Math.random() * 7),
    rating: Math.round((3 + Math.random() * 2) * 10) / 10,
    segments: JSON.stringify(segments[i % segments.length]),
  }));
  await prisma.customerProfile.createMany({ data });
}

async function seedPayouts(providerId) {
  const data = [
    { providerId, amount: 120.5, status: 'paid', date: '2025-07-25' },
    { providerId, amount: 340.0, status: 'paid', date: '2025-08-01' },
    { providerId, amount: 210.75, status: 'pending', date: '2025-08-15' },
  ];
  await prisma.payout.createMany({ data });
}

async function seedForProvider(providerId) {
  // Seed only if there is little/no data to avoid duplicates on repeated calls
  const [evCount, custCount, payoutCount] = await Promise.all([
    prisma.calendarEvent.count({ where: { providerId } }),
    prisma.customerProfile.count({ where: { providerId } }),
    prisma.payout.count({ where: { providerId } }),
  ]);
  if (evCount < 3) await seedCalendar(providerId);
  if (custCount < 5) await seedCustomers(providerId);
  if (payoutCount < 2) await seedPayouts(providerId);
  return true;
}

async function seedOnStart() {
  try {
    // Ensure an admin account exists for dashboard access
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hodhod.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_PHONE = process.env.ADMIN_PHONE || '+96500000000';
    const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL.toLowerCase() } });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await prisma.user.create({
        data: {
          role: 'admin',
          email: ADMIN_EMAIL.toLowerCase(),
          username: 'admin',
          phone: ADMIN_PHONE,
          passwordHash,
          phoneVerified: true,
          profile: { create: { firstName: 'Admin', lastName: 'User' } }
        }
      });
      // eslint-disable-next-line no-console
      console.log(`Admin user seeded: ${ADMIN_EMAIL} / (set via ADMIN_PASSWORD)`);
    }

    // Find any company provider user to seed
    const provider = await prisma.user.findFirst({ where: { role: 'provider', subrole: 'company' }, select: { id: true } });
    if (provider) {
      await seedForProvider(provider.id);
    }
  } catch (e) {
    console.error('dev seed on start error', e);
  }
}

module.exports = { seedForProvider, seedOnStart };


