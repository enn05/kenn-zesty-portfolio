// Server-only Zesty settings.
//
// The stage password comes from ZESTY_STAGE_PASSWORD in .env.local, NOT from
// zesty.config.json. Next only exposes env vars to the browser when they are
// prefixed NEXT_PUBLIC_ or listed in next.config.js `env`, so a plain var can
// never reach a client bundle.
//
// Importing zesty.config.json here instead would defeat that: webpack inlines
// the whole JSON — password included — into any client chunk whose import graph
// reaches this module, even when the value is only read inside
// getServerSideProps. That is exactly what happened before this change.
//
// Keep zesty.config.json's stage_password in sync, or empty it out: the Zesty
// CLI still writes to that file, but nothing in the app reads it any more.

export const stagePassword = process.env.ZESTY_STAGE_PASSWORD || '';
