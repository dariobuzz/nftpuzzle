// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 1) Configurazione Cookie Consent */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var _iub = _iub || [];
              _iub.csConfiguration = {
                "siteId": 4011032,
                "cookiePolicyId": 16252479,
                "lang": "en-GB",
                "storage": { "useSiteId": true }
              };
            `,
          }}
        />

        {/* 2) Autoblocking */}
        <script src="https://cs.iubenda.com/autoblocking/4011032.js"></script>

        {/* 3) GPP stub */}
        <script src="//cdn.iubenda.com/cs/gpp/stub.js"></script>

        {/* 4) Core Iubenda Consent */}
        <script
          src="//cdn.iubenda.com/cs/iubenda_cs.js"
          charSet="UTF-8"
          async
        ></script>
      </Head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
