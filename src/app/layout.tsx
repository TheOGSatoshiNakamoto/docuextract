import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

// Cinematic loading screen CSS — masks font swap with branded overlay.
// All content is static (no user input), safe for dangerouslySetInnerHTML.
const loaderCSS = `
#docuextract-loader {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #0f1117;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 14px;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
}
#docuextract-loader.loaded {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
#docuextract-loader .loader-mark {
  width: 56px;
  height: 56px;
  animation: loaderPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(108,142,245,0.3)) drop-shadow(0 0 40px rgba(108,142,245,0.1));
}
#docuextract-loader .loader-wordmark {
  font-size: 13px;
  font-weight: 500;
  color: rgba(226,232,240,0.4);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
@keyframes loaderPulse {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(108,142,245,0.3)) drop-shadow(0 0 40px rgba(108,142,245,0.1));
    opacity: 0.9;
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(108,142,245,0.5)) drop-shadow(0 0 60px rgba(108,142,245,0.2));
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  #docuextract-loader .loader-mark {
    animation: none;
  }
  #docuextract-loader {
    transition: opacity 0.15s ease-out, visibility 0.15s;
  }
}
`;

// Dismiss loader once fonts are ready, with 2.5s hard timeout fallback.
// Static script — no user input, safe for dangerouslySetInnerHTML.
const loaderScript = `
(function(){
  var l=document.getElementById('docuextract-loader');
  function d(){if(l)l.classList.add('loaded')}
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(d)}else{d()}
  setTimeout(d,2500);
})();
`;

export const metadata: Metadata = {
  title: 'DocuExtract — Send a document, get JSON back',
  description:
    'DocuExtract converts invoices, receipts, contracts, and any document into clean, structured JSON via a single API call. No templates. No training. Works in 5 minutes.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'DocuExtract — Send a document, get JSON back',
    description: 'Zero-config document extraction API. Powered by Claude AI. Free tier available.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body">
        <style dangerouslySetInnerHTML={{ __html: loaderCSS }} />
        <noscript><style dangerouslySetInnerHTML={{ __html: '#docuextract-loader{display:none!important}' }} /></noscript>
        <div id="docuextract-loader" aria-hidden="true">
          <svg className="loader-mark" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#0f1117"/>
            <text x="16" y="23" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="22" fontWeight="800" fill="#6c8ef5">D</text>
          </svg>
          <div className="loader-wordmark">DocuExtract</div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: loaderScript }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
