import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RollLink from './RollLink';

// Real routes now, not anchors into a one-pager.
// Trailing slashes matter: next.config.js sets trailingSlash: true.
const NAV = [['Work', '/work/'], ['Lab', '/lab/'], ['About', '/about/'], ['Contact', '/contact/']];

export default function Header({ email }) {
  const router = useRouter();
  // The landing page (with the hero) is served at both / and /home/ — the root
  // route fetches the Home item explicitly. See pages/index.js.
  const path = router.asPath.split('#')[0];
  const home = path === '/' || path === '/home/';
  const [solid, setSolid] = useState(!home);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!home) { setSolid(true); return; }
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setSolid(!e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(hero);
    return () => io.disconnect();
  }, [home]);

  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <>
      <header className={`site-header${solid ? ' is-solid' : ''}`}>
        <Link href="/"><a className="brand">Kenn Hunat</a></Link>
        <nav className="nav" aria-label="Primary">
          {NAV.map(([label, href]) => <RollLink key={label} href={href}>{label}</RollLink>)}
        </nav>
        <button className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>Menu</button>
      </header>
      <div className={`menu${open ? ' is-open' : ''}`} id="menu" role="dialog" aria-modal="true" aria-label="Menu"
           onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
        <div className="menu-top">
          <Link href="/"><a className="brand" onClick={() => setOpen(false)}>Kenn Hunat</a></Link>
          <button className="menu-btn" style={{ display: 'block' }} onClick={() => setOpen(false)} autoFocus={open}>Close</button>
        </div>
        <nav className="menu-links" aria-label="Menu">
          {NAV.map(([label, href]) => (
            <Link key={label} href={href}><a onClick={() => setOpen(false)}>{label}</a></Link>
          ))}
        </nav>
        <p className="menu-foot">{email}</p>
      </div>
    </>
  );
}