import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* 1) Configurazione Cookie Consent */}
          <Script id="iubenda-cfg" strategy="beforeInteractive">
            {`var _iub = _iub || [];
_iub.csConfiguration = {
  "siteId": 4011032,
  "cookiePolicyId": 16252479,
  "lang": "en-GB",
  "storage": { "useSiteId": true }
};`}
          </Script>

          {/* 2) Autoblocking */}
          <Script
            src="https://cs.iubenda.com/autoblocking/4011032.js"
            strategy="afterInteractive"
          />

          {/* 3) GPP stub */}
          <Script
            src="//cdn.iubenda.com/cs/gpp/stub.js"
            strategy="afterInteractive"
          />

          {/* 4) Core Iubenda Consent */}
          <Script
            src="//cdn.iubenda.com/cs/iubenda_cs.js"
            strategy="afterInteractive"
            charSet="UTF-8"
          />
        </Head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
