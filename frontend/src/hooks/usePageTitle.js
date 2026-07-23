import { useEffect } from 'react';

const BASE = 'Kala Bazaar';
const DEFAULT_DESC = 'Nepal\'s premier marketplace for authentic handmade crafts. Discover unique products from verified Nepali artisans.';

export default function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description || DEFAULT_DESC;
    return () => { document.title = BASE; meta.content = DEFAULT_DESC; };
  }, [title, description]);
}
