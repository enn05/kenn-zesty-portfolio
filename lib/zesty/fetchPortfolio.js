// fetchZestyPortfolio
// One request to the custom /portfolio.json endpoint (a Parsley file in the
// Zesty Code app) instead of one Instant API call per model.
// Server-side only: it needs the stage password.

import { stagePassword } from './serverConfig';

function baseURL() {
  const productionMode =
    undefined === process.env.PRODUCTION || process.env.PRODUCTION === 'true';
  const url = productionMode ? process.env.zesty.production : process.env.zesty.stage;
  return url.replace(/\/$/, '');
}

// Relationship fields: Parsley toJSON() gives a comma-separated ZUID string,
// the Instant API gives { data: [{ zuid }] }. Accept either.
// function refZuids(v) {
//   if (!v) return [];
//   if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
//   return Array.isArray(v.data) ? v.data.map((d) => d.zuid) : [];
// }

function imageUrl(v) {
  if (!v) return null;
  if (typeof v === 'string') return v.startsWith('http') ? v : null;
  return (v.data && v.data[0] && v.data[0].url) || null;
}

const yes = (v) => v === true || v === 1 || v === '1';
export const bySort = (a, b) => a.sort - b.sort;

// Items from toJSON() are flat (fields at top level, plus meta).
// If your curl check shows a `content` wrapper, change this to `i.content`.
const fields = (i) => i;
const zuidOf = (i) => (i.meta && i.meta.zuid) || i.zuid;

// Parsley toJSON() embeds the full related item; the zuid lives at meta.zuid.
function relatedTags(v) {
  if (!v || !Array.isArray(v.data)) return [];
  return v.data.map((d) => ({
    zuid: d.meta && d.meta.zuid,
    name: d.name,
    slug: d.slug,
  }));
}

/**
 * One raw Parsley project -> the shape the UI renders.
 * Shared by /portfolio.json and the filtered /test-view.json so both paths
 * produce identical objects. Server-side only (this module imports serverConfig).
 */
export function normalizeProject(i) {
  const c = fields(i);
  return {
    zuid: zuidOf(i),
    slug: c.slug,
    title: c.title,
    category: c.category,
    client: c.client || '',
    year: c.year || '',
    roles: relatedTags(c.roles),
    stack: relatedTags(c.stack),
    summary: c.summary || '',
    body: c.body || '',
    cover: imageUrl(c.cover),
    liveUrl: c.live_url || '',
    repoUrl: c.repo_url || '',
    featured: yes(c.featured),
    sort: Number(c.sort_order || 0),
  };
}

export async function fetchZestyPortfolio() {
  const res = await fetch(`${baseURL()}/portfolio.json?zpw=${stagePassword}`);
  if (res.status !== 200) {
    throw new Error(`Zesty /portfolio.json responded ${res.status}`);
  }
  const raw = await res.json();

  return {
    roles: raw.roles.map((i) => ({ zuid: zuidOf(i), ...fields(i) })),
    tech: raw.tech.map((i) => ({ zuid: zuidOf(i), ...fields(i) })),
    projects: raw.projects.map(normalizeProject).sort(bySort),
    experience: raw.experience
      .map((i) => ({ ...fields(i), sort: Number(fields(i).sort_order || 0) }))
      .sort(bySort),
    stackGroups: raw.stack_groups
      .map((i) => ({ ...fields(i), sort: Number(fields(i).sort_order || 0) }))
      .sort(bySort),
    site: raw.site_settings[0] ? fields(raw.site_settings[0]) : {},
  };
}
