import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export default function SplitTitle({ text, id }) {
  const ref = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from('.char', {
        yPercent: 105, duration: 1.1, ease: 'expo.out', stagger: 0.045,
        scrollTrigger: { trigger: ref.current, start: 'top 88%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <h2 className="section-title" id={id} ref={ref} aria-label={text}>
      {[...text].map((c, i) => <span className="char" aria-hidden="true" key={i}>{c}</span>)}
    </h2>
  );
}