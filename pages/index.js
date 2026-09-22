import React from 'react';
import Slug from './[...slug]';
import { fetchZestyPage } from 'lib/zesty/fetchPage';
import { fetchZestyPortfolio } from 'lib/zesty/fetchPortfolio';

function IndexPage(content) {
  return <Slug {...content} />;
}

export default IndexPage;

// The portfolio landing page lives on the Home model at /home/ in Zesty, while
// the root URL still holds the older Homepage item. Rather than restructure
// content, the root route fetches the Home item explicitly — so / renders the
// portfolio and the Homepage item stays untouched in the manager.
//
// Change this back to ctx.resolvedUrl to serve whatever Zesty has at /.
const HOME_URI = '/home/';

export async function getServerSideProps() {
  const data = await fetchZestyPage(HOME_URI);
  if (data.error) return { notFound: true };

  data.portfolio = await fetchZestyPortfolio();

  return { props: data };
}
