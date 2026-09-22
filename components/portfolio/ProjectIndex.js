import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import GeneratedCover from "./GeneratedCover";

function unique(list, key) {
  const m = new Map();
  list.forEach(p => p[key].forEach(t => m.set(t.zuid, t)));
  return [...m.values()];
}

export default function ProjectIndex({ projects, variant }) {
  // Filter values are ZUIDs, not slugs: Zesty's /test-view.json matches against
  // the relationship field, which stores ZUIDs.
  const [role, setRole] = useState(null);
  const [stack, setStack] = useState(null);

  // Server-rendered list is the starting state, so first paint needs no fetch.
  const [list, setList] = useState(projects);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // Options come from the full server-rendered set, so they don't shrink as you
  // filter — otherwise the chip you just clicked could vanish.
  const roles = useMemo(() => unique(projects, "roles"), [projects]);
  const stacks = useMemo(() => unique(projects, "stack"), [projects]);

  const reqId = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    // Skip the mount pass: `projects` is already the unfiltered list.
    if (first.current) { first.current = false; return; }

    if (!role && !stack) { setList(projects); setFailed(false); return; }

    const id = ++reqId.current;
    setBusy(true);
    setFailed(false);

    const qs = new URLSearchParams();
    if (role) qs.set("role", role);
    if (stack) qs.set("tech", stack);

    // Trailing slash matters: next.config.js sets trailingSlash: true, so
    // /api/projects would 308-redirect and cost an extra round trip per click.
    fetch(`/api/projects/?${qs}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(({ projects: got }) => {
        if (id !== reqId.current) return; // a newer click already won
        // The endpoint returns work and lab together; this instance renders one.
        setList(got.filter(p => p.category === variant));
      })
      .catch(() => {
        if (id !== reqId.current) return;
        setFailed(true);
        setList([]);
      })
      .finally(() => {
        if (id === reqId.current) setBusy(false);
      });
  }, [role, stack, projects, variant]);

  const clear = () => { setRole(null); setStack(null); };

  const group = (label, opts, value, set) => (
    <div className="filter-group" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      <span className="filter-label">{label}</span>
      <button className="chip" aria-pressed={!value} onClick={() => set(null)}>All</button>
      {opts.map(o => (
        <button key={o.zuid} className="chip" aria-pressed={value === o.zuid} onClick={() => set(o.zuid)}>{o.name}</button>
      ))}
    </div>
  );

  const cover = (p) => p.cover
    ? <img src={`${p.cover}?width=800`} alt="" width={800} height={600} loading="lazy" />
    : <GeneratedCover seed={p.slug} />;

  return (
    <>
      <div className="filters">
        {group("Role", roles, role, setRole)}
        {group("Stack", stacks, stack, setStack)}
      </div>

      <div aria-live="polite" aria-busy={busy}>
        {failed && (
          <p className="empty">
            Could not load projects.{" "}
            <button onClick={() => { const r = role; setRole(null); setRole(r); }}>Try again</button>
          </p>
        )}

        {!failed && !busy && !list.length && (
          <p className="empty">
            No projects match these filters.{" "}
            <button onClick={clear}>Show all projects</button>
          </p>
        )}

        {variant === "work" && list.length > 0 && (
          <ul className="project-list is-entering" key={`${role}-${stack}`} style={{ opacity: busy ? 0.5 : 1 }}>
            {list.map(p => (
              <li className="project-row" key={p.zuid}>
                <Link href={`/projects/${p.slug}/`}>
                  <a className="project-link" data-slug={p.slug}>
                    <span className="p-title">{p.title}</span>
                    <span className="p-meta">
                      <span><span className="p-label">Client</span>{p.client}</span>
                      <span><span className="p-label">Role</span>{p.roles.map(r => r.name).join(", ")}</span>
                    </span>
                    <span className="p-year">{p.year}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {variant === "lab" && list.length > 0 && (
          <ul className="lab-grid is-entering" key={`${role}-${stack}`} style={{ opacity: busy ? 0.5 : 1 }}>
            {list.map(p => (
              <li className="lab-item" key={p.zuid}>
                <Link href={`/projects/${p.slug}/`}>
                  <a className="lab-card">
                    {cover(p)}
                    <span className="lab-title">{p.title}</span>
                    <span className="lab-summary">{p.summary}</span>
                    <span className="lab-stack">{p.stack.map(t => t.name).join(", ")}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
