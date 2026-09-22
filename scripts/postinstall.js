/**
 * The Zesty starter runs `zesty init && npm run sync` after every install.
 * Both need interactive auth and a logged-in CLI, so they fail in any build
 * environment (Cloud Build, Docker, CI). Skip there; run normally on a laptop.
 *
 * After adding a content model in Zesty, run `npm run sync` yourself.
 */
const { execSync } = require('child_process');

const inBuild =
  process.env.CI ||
  process.env.SKIP_ZESTY_SYNC ||
  process.env.VERCEL ||                 // Vercel (also sets CI=1)
  process.env.GOOGLE_CLOUD_PROJECT ||   // Cloud Build / Cloud Run
  process.env.BUILDER_OUTPUT;           // Cloud Build buildpacks

if (inBuild) {
  console.log('postinstall: build environment detected, skipping zesty init/sync');
  process.exit(0);
}

try {
  execSync('zesty init && npm run sync', { stdio: 'inherit' });
} catch (err) {
  console.warn('postinstall: zesty init/sync failed — continuing anyway.');
  console.warn('Run `npm run sync` manually once the Zesty CLI is authenticated.');
}
