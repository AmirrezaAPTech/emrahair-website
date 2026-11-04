import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware replacements for next/link and next/navigation. Importing these
 * rather than the framework originals is what keeps the active locale on every
 * internal link without threading it through by hand.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
