import { useEffect } from 'react';

// index.html ships meta[name=robots]=index,follow for the public page, and
// robots.txt disallows /admin outright — but the SPA fallback (vercel.json)
// serves that same prerendered index.html for /admin and /admin/dashboard
// too, so a crawler that ignores robots.txt would otherwise see "index,
// follow" on the admin routes. This flips it to noindex while an admin
// route is mounted, and restores the original value on unmount.
export function useNoIndex() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const previous = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (previous !== null) meta?.setAttribute('content', previous);
    };
  }, []);
}
