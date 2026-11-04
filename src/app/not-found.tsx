import Link from 'next/link';
import '@/styles/tokens.css';
import '@/styles/base.css';

export default function GlobalNotFound() {
  return (
    <html lang="tr-TR">
      <body className="on-light">
        <main
          style={{
            minHeight: '100svh',
            display: 'grid',
            placeContent: 'center',
            justifyItems: 'center',
            gap: '2rem',
            padding: 'var(--gutter)',
            textAlign: 'center',
          }}
        >
          <p className="eyebrow">404</p>
          <h1 className="display display--l">
            Bu sayfa <em>bulunamadı.</em>
          </h1>
          <Link className="link-arrow" href="/">
            <span>Ana sayfaya dön</span>
            <span className="link-arrow__line" aria-hidden="true" />
          </Link>
        </main>
      </body>
    </html>
  );
}
