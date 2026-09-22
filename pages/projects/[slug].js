import React from 'react';
import Link from 'next/link';
import Portfolio from 'layout/Portfolio';
import CaseBar from 'components/portfolio/CaseBar';
import GeneratedCover from 'components/portfolio/GeneratedCover';
import { fetchZestyPortfolio } from 'lib/zesty/fetchPortfolio';
import { splitSections } from 'lib/zesty/splitSections';

export default function ProjectPage({ project, next, site }) {
  const p = project;

  return (
    <Portfolio site={site} chrome={<CaseBar />}>
      <main id="main">
        <article className="case-inner">
          <h1 className="case-title">{p.title}</h1>
          <p className="case-summary">{p.summary}</p>
          <dl className="case-meta">
            <div><dt>Client</dt><dd>{p.client}</dd></div>
            <div><dt>Role</dt><dd>{p.roles.map((r) => r.name).join(', ')}</dd></div>
            <div><dt>Stack</dt><dd>{p.stack.map((t) => t.name).join(', ')}</dd></div>
            <div><dt>Year</dt><dd>{p.year}</dd></div>
          </dl>

          {(p.liveUrl || p.repoUrl) && (
            <div className="case-links">
              {p.liveUrl && <a className="roll" href={p.liveUrl} target="_blank" rel="noopener"><span data-text="Visit site">Visit site</span></a>}
              {p.repoUrl && <a className="roll" href={p.repoUrl} target="_blank" rel="noopener"><span data-text="View code">View code</span></a>}
            </div>
          )}

          <div className="case-cover-wrap">
            {p.cover
              ? <img className="case-cover" src={`${p.cover}?width=1680`} alt="" />
              : <GeneratedCover seed={p.slug} className="case-cover" />}
          </div>

          <div className="case-body">
            {splitSections(p.body).map((s) => (
              <section className="case-block" key={s.heading}>
                <h2>{s.heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: s.body }} />
              </section>
            ))}
          </div>

          <Link href={`/projects/${next.slug}/`}>
            <a className="case-next"><span>Next project</span><strong>{next.title}</strong></a>
          </Link>
        </article>
      </main>
    </Portfolio>
  );
}

export async function getServerSideProps(ctx) {
  const portfolio = await fetchZestyPortfolio();
  const i = portfolio.projects.findIndex((p) => p.slug === ctx.params.slug);
  if (i < 0) return { notFound: true };

  return {
    props: {
      project: portfolio.projects[i],
      next: portfolio.projects[(i + 1) % portfolio.projects.length],
      site: portfolio.site,
    },
  };
}