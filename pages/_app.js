import React from 'react';
import Head from 'next/head';
import ZestyHead from 'components/zesty/ZestyHead';
import RouteProgress from 'components/portfolio/RouteProgress';
import 'styles/portfolio.css';


function MyApp({ Component, pageProps }) {
  return(
    <>
      {/* logic to run zesty head if it detects zesty meta data patterns in props, else load alternate head for you to edit */}
      {pageProps?.meta?.web &&
              <ZestyHead content={pageProps} />
              || 
              <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders:wght@600;700;800&family=Hanken+Grotesk:wght@400;500;600&display=swap" />
                <meta charSet="utf-8" />
                <title>Zesty.io Next.js Marketing Technology Example Starter</title>   
              </Head>
            }
      <RouteProgress />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp;
