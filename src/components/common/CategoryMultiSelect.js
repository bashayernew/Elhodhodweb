import React, { useEffect, useMemo, useState } from 'react';

// Props:
// - value: string[] of selected slugs
// - onChange: (slugs[]) => void
// - division: 'services' | 'products' | 'both'
const CategoryMultiSelect = ({ value = [], onChange, division = 'services' }) => {
  const [serviceCats, setServiceCats] = useState([]);
  const [productCats, setProductCats] = useState([]);
  const selected = new Set(value);

  useEffect(() => {
    const load = async () => {
      // Try API categories (services) first
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (res.ok && (Array.isArray(data?.data) || Array.isArray(data))) {
          const raw = (data.data || data);
          const arr = [];
          raw.forEach((c) => {
            const catName = c.nameEn || c.name?.en || c.label || String(c.slug || c.id);
            if (Array.isArray(c.subcategories) && c.subcategories.length) {
              c.subcategories.forEach((s) => {
                arr.push({ slug: s.slug || s.id, name: s.nameEn || s.name?.en || s.label || s.slug || s.id });
              });
            } else {
              arr.push({ slug: c.slug || c.id, name: catName });
            }
          });
          setServiceCats(arr);
        } else {
          throw new Error('fallback');
        }
      } catch (_) {
        try {
          const fallback = await fetch('/data/service-categories.json').then((r) => r.json());
          const arr = [];
          (fallback.categories || fallback || []).forEach((c) => {
            const catName = c.nameEn || c.name?.en || c.label || c.title || c.slug || c.id;
            if (Array.isArray(c.subcategories) && c.subcategories.length) {
              c.subcategories.forEach((s) => arr.push({ slug: s.slug || s.id, name: s.nameEn || s.name?.en || s.label || s.slug || s.id }));
            } else {
              arr.push({ slug: c.slug || c.id, name: catName });
            }
          });
          setServiceCats(arr);
        } catch {
          setServiceCats([]);
        }
      }

      // Load product categories (static for now)
      try {
        const prod = await fetch('/data/product-categories.json').then((r) => r.json());
        const arr = [];
        (prod.categories || prod || []).forEach((c) => {
          const catName = c.nameEn || c.name?.en || c.label || c.title || c.slug || c.id;
          if (Array.isArray(c.subcategories) && c.subcategories.length) {
            c.subcategories.forEach((s) => arr.push({ slug: s.slug || s.id, name: s.nameEn || s.name?.en || s.label || s.slug || s.id }));
          } else {
            arr.push({ slug: c.slug || c.id, name: catName });
          }
        });
        setProductCats(arr);
      } catch {
        setProductCats([]);
      }
    };
    load();
  }, []);

  const visibleGroups = useMemo(() => {
    if (division === 'products') return [{ title: 'Product Categories', items: productCats }];
    if (division === 'both') return [
      { title: 'Service Categories', items: serviceCats },
      { title: 'Product Categories', items: productCats }
    ];
    return [{ title: 'Service Categories', items: serviceCats }];
  }, [division, serviceCats, productCats]);

  const toggle = (slug) => {
    const s = new Set(selected);
    if (s.has(slug)) s.delete(slug); else s.add(slug);
    onChange(Array.from(s));
  };

  return (
    <div className="space-y-4">
      {visibleGroups.map((group) => (
        <div key={group.title}>
          {division === 'both' && (<div className="text-xs font-medium text-gray-600 mb-1">{group.title}</div>)}
          <div className="border rounded-lg p-3 max-h-56 overflow-auto">
            {group.items.map((c) => (
              <div key={c.slug} className="py-1">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={selected.has(c.slug)} onChange={() => toggle(c.slug)} />
                  <span className="text-sm">{c.name}</span>
                </label>
              </div>
            ))}
            {group.items.length === 0 && <p className="text-xs text-gray-500">Loading categories...</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryMultiSelect;


