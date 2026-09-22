import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Thin progress bar across the top of the viewport during client-side
 * navigation.
 *
 * Worth having here because every page uses getServerSideProps: a click waits
 * on a Zesty round-trip before anything changes on screen, which otherwise
 * looks like the link did nothing.
 *
 * The width is CSS-driven — it eases toward 90% over a long duration so it
 * looks like it is slowing down, then snaps to 100% and fades when the route
 * resolves. No dependency; nprogress would drag in its own stylesheet and
 * colours that do not match the design tokens.
 */
export default function RouteProgress() {
  const router = useRouter();
  const [phase, setPhase] = useState('idle'); // idle | loading | done
  const hideTimer = useRef(null);

  useEffect(() => {
    const pathOf = (url) => url.split('#')[0].split('?')[0];

    const start = (url) => {
      // Hash and query-only changes resolve instantly; a flashing bar there is
      // noise rather than feedback.
      if (pathOf(url) === pathOf(router.asPath)) return;
      clearTimeout(hideTimer.current);
      setPhase('idle');
      // Force a frame at 0 width so the transition actually runs, instead of
      // the browser collapsing 0 -> 90% into no visible change.
      requestAnimationFrame(() => setPhase('loading'));
    };

    const done = () => {
      setPhase('done');
      hideTimer.current = setTimeout(() => setPhase('idle'), 400);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      clearTimeout(hideTimer.current);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  }, [router]);

  return (
    <div
      className={`route-progress is-${phase}`}
      role="progressbar"
      aria-hidden={phase === 'idle'}
      aria-label="Loading page"
    />
  );
}
