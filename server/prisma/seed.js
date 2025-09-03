/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed categories from public JSON
  const categoriesPath = path.join(__dirname, '../../public/data/service-categories.json');
  if (fs.existsSync(categoriesPath)) {
    const json = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    const items = json.categories || [];
    let order = 0;
    for (const c of items) {
      const cat = await prisma.category.upsert({
        where: { slug: c.id },
        update: { nameEn: c.name?.en || c.id, nameAr: c.name?.ar || c.id, sortOrder: order, isActive: true },
        create: { slug: c.id, nameEn: c.name?.en || c.id, nameAr: c.name?.ar || c.id, sortOrder: order, isActive: true },
      });
      order += 1;
      let subOrder = 0;
      for (const s of c.subcategories || []) {
        await prisma.subcategory.upsert({
          where: { categoryId_slug: { categoryId: cat.id, slug: s.id } },
          update: { nameEn: s.name?.en || s.id, nameAr: s.name?.ar || s.id, sortOrder: subOrder, isActive: true },
          create: { categoryId: cat.id, slug: s.id, nameEn: s.name?.en || s.id, nameAr: s.name?.ar || s.id, sortOrder: subOrder, isActive: true },
        });
        subOrder += 1;
      }
    }
    console.log('✅ Seeded categories and subcategories');
  } else {
    console.log('ℹ️ Categories JSON not found, skipping category seed');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});


