import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  /* iOS collapses its address bar during the first scroll, which fires a
     window resize; ScrollTrigger's default response is a full refresh, and a
     refresh in the middle of a momentum flick is what kills the flick — the
     page stops dead and the visitor has to swipe again. This tells it to
     ignore resizes where only the height moved on touch devices, which is
     exactly and only the address-bar case. Rotation still refreshes. */
  ScrollTrigger.config({ ignoreMobileResize: true });
  /* The house curve. Everything decelerates the same way, which is most of
     what makes a set of unrelated animations feel like one hand made them. */
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
}

export { gsap, ScrollTrigger };
