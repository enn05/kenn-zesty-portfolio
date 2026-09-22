import React from 'react';
import SplitTitle from './SplitTitle';

/**
 * Title + optional intro, shared by every section page.
 * `id` seeds both the aria-labelledby target and the heading id, so a page
 * uses <section aria-labelledby={`${id}Title`}>.
 */
export default function SectionHead({ id, title, intro }) {
  return (
    <div className="section-head">
      <SplitTitle id={`${id}Title`} text={title} />
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}
