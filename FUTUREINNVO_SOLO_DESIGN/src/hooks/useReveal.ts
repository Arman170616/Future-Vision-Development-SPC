import { useEffect, useRef } from 'react';

/**
 * Adds `is-visible` to every `.reveal` inside the returned ref once it scrolls into view.
 * Also picks up `.reveal` elements rendered later (e.g. sections filled from the API).
 */
export const useReveal = <T extends HTMLElement = HTMLDivElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const pending = () => root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)');

    if (!('IntersectionObserver' in window)) {
      const showAll = () => pending().forEach(el => el.classList.add('is-visible'));
      showAll();
      const mo = new MutationObserver(showAll);
      mo.observe(root, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    const observeAll = () => pending().forEach(el => observer.observe(el));
    observeAll();

    const mo = new MutationObserver(observeAll);
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      observer.disconnect();
    };
  }, []);

  return ref;
};
