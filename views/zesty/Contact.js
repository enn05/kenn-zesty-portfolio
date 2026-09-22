/**
  * Zesty.io Content Model Component
  * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
  *
  * Label: Contact
  * Name: contact
  * Model ZUID: 6-f6c498b9a0-wvjx20
  * File Created On: Tue Sep 22 2026 22:22:33 GMT+0800 (Singapore Standard Time)
  *
  * Model Fields:
  *
   * intro (textarea)
 * blurb (wysiwyg_basic)
  *
  * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
  * images are objects {content.image_name.data[0].url}
  *
  * This file is expected to be customized; because of that, it is not overwritten by the integration script.
  * Model and field changes in Zesty.io will not be reflected in this comment.
  *
  * View and Edit this model's current schema on Zesty.io at https://8-e0e1b1ecd2-bpl6qk.manager.zesty.io/schema/6-f6c498b9a0-wvjx20
  *
  * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
  * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
  */
 
import React from 'react';
import Portfolio from 'layout/Portfolio';
import SectionHead from 'components/portfolio/SectionHead';
import ContactBody from 'components/portfolio/ContactBody';

export default function Contact({ content }) {
  const { site } = content.portfolio;

  return (
    // hideFooter: the contact block is the page body here, so the layout must
    // not also render it as the footer.
    <Portfolio site={site} hideFooter>
      <main id="main">
        <section className="section" id="contact" aria-labelledby="contactTitle">
          <SectionHead id="contact" title="Contact" intro={content.intro} />
          <ContactBody site={site} blurb={content.blurb} compact={false} />
        </section>
      </main>
    </Portfolio>
  );
}
