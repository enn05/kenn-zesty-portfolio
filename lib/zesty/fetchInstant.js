// fetchZestyInstant
// Fetches a model's items from the Instant API, e.g. /-/instant/6-xxxx.json
// Mirrors lib/zesty/fetchPage.js: picks stage or production from PRODUCTION,
// and appends zpw because the preview domain is password protected (401 without it).
// Call this from getServerSideProps only, so the password stays on the server.

import { stagePassword } from './serverConfig';

export async function fetchZestyInstant(modelZUID) {
  const productionMode =
    undefined === process.env.PRODUCTION || process.env.PRODUCTION === 'true';

  let zestyURL = productionMode
    ? process.env.zesty.production
    : process.env.zesty.stage;
  zestyURL = zestyURL.replace(/\/$/, '');

  const url = `${zestyURL}/-/instant/${modelZUID}.json?zpw=${stagePassword}`;

  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(`Zesty Instant API ${modelZUID} responded ${res.status}`);
  }
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [json.data];
}
