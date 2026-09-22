import React from 'react';
import SectionHead from './SectionHead';
import CopyEmail from './CopyEmail';
import LocalTime from './LocalTime';
import RollLink from './RollLink';

/**
 * The contact block, in two sizes.
 *
 * compact (default) — the site-wide footer rendered by layout/Portfolio.
 * compact={false}   — the /contact/ page: adds the wysiwyg blurb and a CV link
 *                     when site_settings.cv is set.
 *
 * `intro` is optional. It used to come from the Home item's contact_intro,
 * which is only in scope on /home/; every other page simply omits the line.
 * To show it everywhere, add a contact_intro field to the site_settings model
 * and pass site.contact_intro.
 */
export default function ContactBody({ site = {}, intro, blurb, compact = true }) {
  const cv = site.cv && site.cv.data && site.cv.data[0] && site.cv.data[0].url;

  const Wrapper = compact ? 'footer' : 'div';

  return (
    <Wrapper
      className="contact"
      id={compact ? 'contact' : undefined}
      aria-labelledby={compact ? 'contactTitle' : undefined}
    >
      {compact && <SectionHead id="contact" title="Contact" intro={intro} />}

      {!compact && blurb && (
        <div className="about-bio" dangerouslySetInnerHTML={{ __html: blurb }} />
      )}

      <a className="email" href={`mailto:${site.email}`}>{site.email}</a>

      <div className="contact-row">
        <CopyEmail email={site.email} />
        {site.linkedin_url && <RollLink href={site.linkedin_url} external>LinkedIn</RollLink>}
        {site.github_url && <RollLink href={site.github_url} external>GitHub</RollLink>}
        {!compact && cv && <RollLink href={cv} external>Download CV</RollLink>}
      </div>

      <div className="contact-meta">
        <LocalTime />
        <p>© {new Date().getFullYear()} Kenn Hunat</p>
        <RollLink href="#top">Back to top</RollLink>
      </div>

      {compact && <p className="wordmark" aria-hidden="true">KENN</p>}
    </Wrapper>
  );
}
