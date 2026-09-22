import React from 'react';
import Head from 'next/head';
import Header from 'components/portfolio/Header';
import ContactBody from 'components/portfolio/ContactBody';
import ConstellationBg from 'components/portfolio/ConstellationBg';

/**
 * `chrome`     replaces the site header for pages that supply their own top bar
 *              (case studies pass <CaseBar />). Omit it for the normal header.
 * `hideFooter` drops the contact footer, for /contact/ which renders the block
 *              itself as the page body.
 */
/**
 * `background` renders the constellation canvas behind everything. Pass false
 * on pages that already own the viewport visually — /home/ runs the Three.js
 * particle hero, whose canvas is transparent, so both fields would show at once.
 */
export default function Portfolio({
  site = {},
  contactIntro,
  chrome,
  hideFooter = false,
  background = true,
  children,
}) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@600;700;800&family=Hanken+Grotesk:wght@400;500;600&display=swap" />
      </Head>

      {background && <ConstellationBg />}

      <a className="skip" href="#main">Skip to content</a>
      {chrome || <Header email={site.email} />}
      {children}

      {!hideFooter && <ContactBody site={site} intro={contactIntro} />}
    </>
  );
}
