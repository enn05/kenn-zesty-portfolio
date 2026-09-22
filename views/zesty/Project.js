/**
  * Zesty.io Content Model Component
  * When the ZestyLoader [..slug].js file is used, this component will autoload if it associated with the URL
  *
  * Label: Projects
  * Name: projects
  * Model ZUID: 6-a89ffdf5cc-qck4w8
  * File Created On: Fri Sep 18 2026 01:29:45 GMT+0800 (Singapore Standard Time)
  *
  * Model Fields:
  *
   * title (text)
 * slug (text)
 * category (dropdown)
 * client (text)
 * year (text)
 * roles (one_to_many)
 * stack (one_to_many)
 * summary (textarea)
 * body (wysiwyg_basic)
 * cover (images)
 * live_url (link)
 * repo_url (link)
 * featured (yes_no)
 * sort_order (number)
  *
  * In the render function, text fields can be accessed like {content.field_name}, relationships are arrays,
  * images are objects {content.image_name.data[0].url}
  *
  * This file is expected to be customized; because of that, it is not overwritten by the integration script.
  * Model and field changes in Zesty.io will not be reflected in this comment.
  *
  * View and Edit this model's current schema on Zesty.io at https://8-e0e1b1ecd2-bpl6qk.manager.zesty.io/schema/6-a89ffdf5cc-qck4w8
  *
  * Data Output Example: https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index#tojson
  * Images API: https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation
  */
 
 import React  from 'react';
 
 function Project({ content }) {
     return (
         <>
             {/* Zesty.io Output Example and accessible JSON object for this component. Delete or comment out when needed.  */}
             <h1 dangerouslySetInnerHTML={{__html:content.meta.web.seo_meta_title}}></h1>
             <div>{content.meta.web.seo_meta_description}</div>
             {/* End of Zesty.io output example */}
         </>
     );
 }
 
 export default Project;
 