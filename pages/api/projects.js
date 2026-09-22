/**
 * Filtered project list.
 *
 * Proxies Zesty's /test-view.json custom endpoint, which filters projects by a
 * role ZUID and/or a tech ZUID:
 *
 *   {{each projects as p where p.roles like "%{request.queryParam(role)}%"
 *                         and p.stack like "%{request.queryParam(tech)}%"
 *                         sort by p.sort_order}}
 *
 * Why proxy instead of calling Zesty from the browser: the preview domain is
 * password protected, so a direct client fetch would have to put zpw in a URL
 * the browser can see. Here the password stays server-side and the client talks
 * to this same-origin route instead.
 *
 * GET /api/projects?role=<zuid>&tech=<zuid>   (both optional)
 *   -> { projects: [ ...normalized ] }
 *
 * Empty or omitted params widen the LIKE to "%%", which matches everything.
 */

import { stagePassword } from 'lib/zesty/serverConfig';
import { normalizeProject, bySort } from 'lib/zesty/fetchPortfolio';

function baseURL() {
  const productionMode =
    undefined === process.env.PRODUCTION || process.env.PRODUCTION === 'true';
  const url = productionMode ? process.env.zesty.production : process.env.zesty.stage;
  return url.replace(/\/$/, '');
}

// Only ever forward things that look like Zesty item ZUIDs (7-xxxxxxxx-xxxxxx).
// The values are interpolated into a Parsley LIKE, so don't pass through
// arbitrary caller input.
const ZUID = /^7-[0-9a-z]+-[0-9a-z]+$/i;
const safe = (v) => (typeof v === 'string' && ZUID.test(v) ? v : '');

export default async function handler(req, res) {
  const role = safe(req.query.role);
  const tech = safe(req.query.tech);

  const qs = new URLSearchParams({ zpw: stagePassword, role, tech });
  const url = `${baseURL()}/test-view.json?${qs}`;

  try {
    const upstream = await fetch(url);
    if (upstream.status !== 200) {
      return res.status(502).json({ error: `Zesty responded ${upstream.status}` });
    }
    const raw = await upstream.json();
    const projects = (raw.projects || []).map(normalizeProject).sort(bySort);

    // Same freshness as the rest of the site; safe to cache at the edge since
    // the response depends only on the query string.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ projects });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Zesty' });
  }
}
