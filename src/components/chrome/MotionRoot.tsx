'use client';

import { useEffect } from 'react';

import { ScrollTrigger } from '@/motion/lib/gsap';
import { initScroll } from '@/motion/modules/scroll';
import { initReveals } from '@/motion/modules/reveal';
import { armHeroIntro, playHeroIntro, initHeroScroll } from '@/motion/modules/hero';
import { initParallax } from '@/motion/modules/parallax';
import { initServicePreview } from '@/motion/modules/service-preview';
import { initServiceVideo } from '@/motion/modules/service-video';
import { initHeroVideo } from '@/motion/modules/hero-video';
import { initDragScroll } from '@/motion/modules/drag-scroll';
import type { Teardown } from '@/motion/lib/env';

/**
 * The single owner of every scroll- and pointer-driven effect on the page.
 *
 * The sections themselves stay server components carrying data attributes, so
 * the markup ships as plain HTML and only this one client component brings
 * JavaScript with it. Every module returns its own teardown, which matters
 * twice: React runs effects twice in development, and switching language is a
 * full navigation that remounts the tree.
 */
export function MotionRoot() {
  useEffect(() => {
    let cancelled = false;
    const teardowns: Teardown[] = [];

    // Everything that decides where an element sits runs before the cover
    // lifts, so nothing jumps into place while the visitor is watching.
    armHeroIntro();
    teardowns.push(initScroll());
    teardowns.push(initReveals());
    teardowns.push(initParallax());
    teardowns.push(initServicePreview());
    teardowns.push(initServiceVideo());
    teardowns.push(initHeroVideo());
    teardowns.push(initDragScroll());
    teardowns.push(initHeroScroll());

    ScrollTrigger.refresh();

    // No preloader on this site: the intro plays as soon as the tree mounts.
    requestAnimationFrame(() => {
      if (cancelled && !document.querySelector('[data-hero]')) return;
      playHeroIntro();
    });

    // Rotating a phone changes every trigger position on the page. Only a
    // WIDTH change refreshes: on iOS the address bar collapsing during the
    // first scroll fires resize with a height change alone, and a refresh in
    // the middle of a momentum flick stops the flick dead. Width cannot
    // change without rotation or a real window resize.
    let resizeTimer: number;
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 220);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      teardowns.forEach((fn) => fn());
    };
  }, []);

  return null;
}
