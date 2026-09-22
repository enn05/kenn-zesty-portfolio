// Pure helper, safe to import from client components.
//
// Deliberately kept out of fetchPortfolio.js: that module imports serverConfig,
// which reads zesty.config.json. Importing it from a component would pull the
// whole config — stage_password included — into the client bundle.

/** Split WYSIWYG HTML into [{ heading, body }] at each <h2>. */
export function splitSections(html) {
  if (!html) return [];
  const parts = html.split(/<h2[^>]*>/i);
  if (parts.length === 1) return [{ heading: 'Overview', body: html }];
  return parts.slice(1).map((p) => {
    const [heading, ...rest] = p.split(/<\/h2>/i);
    return { heading: heading.replace(/<[^>]+>/g, '').trim(), body: rest.join('') };
  });
}
