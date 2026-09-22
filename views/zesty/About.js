/**
  * Zesty.io Content Model Component
  * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
  *
  * Label: About
  * Name: about
  * Model ZUID: 6-8efa80a2ad-30j9f9
  * File Created On: Mon Sep 21 2026 22:26:40 GMT+0800 (Singapore Standard Time)
  *
  * Model Fields:
  *
   * bio (wysiwyg_basic)
  *
  * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
  * images are objects {content.image_name.data[0].url}
  *
  * This file is expected to be customized; because of that, it is not overwritten by the integration script.
  * Model and field changes in Zesty.io will not be reflected in this comment.
  *
  * View and Edit this model's current schema on Zesty.io at https://8-e0e1b1ecd2-bpl6qk.manager.zesty.io/schema/6-8efa80a2ad-30j9f9
  *
  * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
  * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
  */
 
import React from 'react';
import Portfolio from 'layout/Portfolio';
import SectionHead from 'components/portfolio/SectionHead';
import AboutBody from 'components/portfolio/AboutBody';

export default function About({ content }) {
  const { experience, stackGroups, site } = content.portfolio;

  return (
    <Portfolio site={site} contactIntro={site.contact_intro}>
      <main id="main">
        <section className="section" id="about" aria-labelledby="aboutTitle">
          <SectionHead id="about" title="About" />
          <AboutBody bio={content.bio} stackGroups={stackGroups} experience={experience} />
        </section>
      </main>
    </Portfolio>
  );
}
