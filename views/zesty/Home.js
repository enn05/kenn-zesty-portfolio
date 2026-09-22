/**
  * Zesty.io Content Model Component
  * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
  *
  * Label: Home
  * Name: home
  * Model ZUID: 6-8ceadfefd4-hgd702
  * File Created On: Fri Sep 18 2026 01:29:45 GMT+0800 (Singapore Standard Time)
  *
  * Model Fields:
  *
   * hero_lede (text)
 * hero_hint (text)
 * statement_1 (text)
 * statement_2 (text)
 * work_intro (text)
 * lab_intro (text)
 * contact_intro (textarea)
 * bio (wysiwyg_basic)
  *
  * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
  * images are objects {content.image_name.data[0].url}
  *
  * This file is expected to be customized; because of that, it is not overwritten by the integration script.
  * Model and field changes in Zesty.io will not be reflected in this comment.
  *
  * View and Edit this model's current schema on Zesty.io at https://8-e0e1b1ecd2-bpl6qk.manager.zesty.io/schema/6-8ceadfefd4-hgd702
  *
  * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
  * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
  */
 
import React from 'react';
import Portfolio from 'layout/Portfolio';
import Hero from 'components/portfolio/Hero';

// Work, Lab, About and Contact are their own pages now (views/zesty/Work.js
// etc). This is the landing page: hero + statement only.
export default function Home({ content }) {
  const { site } = content.portfolio;

  return (
    <Portfolio site={site} contactIntro={content.contact_intro || site.contact_intro}>
      <main id="main">
        <Hero lede={content.hero_lede} hint={content.hero_hint} />

        <section className="statement" id="intro" aria-label="Summary">
          <p>{content.statement_1}</p>
          <p>{content.statement_2}</p>
        </section>
      </main>
    </Portfolio>
  );
}
