import type { ReactNode } from 'react';

/**
 * The root layout exists only to satisfy Next's requirement for one. Every
 * real document concern — lang, dir, metadata, the shell — belongs to
 * app/[locale]/layout.tsx, which is the layout that actually knows the locale.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
