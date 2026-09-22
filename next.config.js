// zesty imports
const { fetchZestyRedirects } = require('./lib/zesty/fetchRedirects');
const zestyConfig = require('./zesty.config.json');

// Everything in zesty.config.json except the stage password is safe to expose
// to the browser. The password stays server-side: see lib/zesty/serverConfig.js.
const { stage_password, ...zestyPublic } = zestyConfig;

// next config
module.exports = {
  // Emits .next/standalone — a self-contained server with only the node_modules
  // it actually uses. Cuts the Cloud Run image from ~500MB to ~80MB and makes
  // cold starts noticeably faster. Ignored by `next dev`.
  output: 'standalone',
  trailingSlash: true,
  // three@0.186 emits ES2022 static initialization blocks (`static { … }`).
  // Next 12's bundled Terser cannot parse those and fails the production build
  // with "Unexpected token: punc ({)". SWC handles modern syntax and is the
  // default minifier from Next 13 onward.
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  async redirects() {
    return  await fetchZestyRedirects(zestyConfig)
  }, 
  env: {
      zesty: zestyPublic
  }
}
