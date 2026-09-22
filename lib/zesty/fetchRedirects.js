// fetchRedirects, get the list of all redirects set in the content manager, loads into next.config.js
async function fetchZestyRedirects(zestyConfig) {

  let productionMode =
  process.env.PRODUCTION === 'true' || process.env.PRODUCTION === true
    ? true
    : false;

  let zestyURL = productionMode ? zestyConfig.production : zestyConfig.stage;

  zestyURL = zestyURL.replace(/\/$/, '');

  // The password comes from the environment, not zesty.config.json — that file
  // is committed, so its stage_password is intentionally blank. Falls back to
  // the config value for anyone still keeping it there locally.
  const zpw = process.env.ZESTY_STAGE_PASSWORD || zestyConfig.stage_password || '';

  // access the headless url map
  let redirectsAPIURL = zestyURL+'/-/headless/redirects.json?zpw=' + zpw;
  try {
    const req = await fetch(redirectsAPIURL);
    let redirects = await req.json();
    let redirectsForNext = []
    redirects.forEach(r => {
      redirectsForNext.push({
        source: r.path,
        destination: r.target,
        permanent: r.code == 301 ? true : false,
      })
    })
    return redirectsForNext;

  } catch (err){
    console.log(err)
    return []
  }
}

module.exports = { fetchZestyRedirects };
