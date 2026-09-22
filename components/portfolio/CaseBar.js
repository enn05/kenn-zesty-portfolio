import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Page chrome for a case study, replacing the site header.
 *
 * In portfolio.html a case study was a full-screen overlay and Close dismissed
 * it. Here it is a real page, so Close navigates: back if the visitor arrived
 * from within the site, otherwise to the Work section. Escape does the same,
 * matching the prototype's keyboard behaviour.
 */
export default function CaseBar({ closeHref = '/work/' }) {
  const router = useRouter();

  const close = () => {
    // history.length > 2 means there is somewhere of ours to go back to;
    // on a cold load (shared link, new tab) fall through to the Work section.
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
      router.push(closeHref);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <div className="case-bar">
      <Link href="/"><a className="brand">Kenn Hunat</a></Link>
      <button className="case-close roll" onClick={close} aria-label="Close case study">
        <span data-text="Close">Close</span>
      </button>
    </div>
  );
}
