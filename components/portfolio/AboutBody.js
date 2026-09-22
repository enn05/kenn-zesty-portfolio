import React from 'react';

/**
 * Bio + stack groups + experience timeline.
 *
 * `bio` comes from the routed item (the About page's own field); stackGroups
 * and experience are datasets and arrive via content.portfolio.
 */
export default function AboutBody({ bio, stackGroups = [], experience = [] }) {
  return (
    <div className="about-grid">
      <div className="about-bio">
        {bio && <div dangerouslySetInnerHTML={{ __html: bio }} />}
        {stackGroups.length > 0 && (
          <div className="stack-groups">
            {stackGroups.map((g) => (
              <div key={g.label}>
                <h3>{g.label}</h3>
                <p>{g.items}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {experience.length > 0 && (
        <ol className="timeline" aria-label="Experience">
          {experience.map((e) => (
            <li key={`${e.title}-${e.period}`}>
              <span className="t-when">{e.period}</span>
              <span className="t-what">
                {e.title}
                <span className="t-where">{e.organization}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
