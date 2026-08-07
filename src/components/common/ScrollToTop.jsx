import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType(); // 'PUSH' | 'REPLACE' | 'POP'

  useEffect(() => {
    // On POP navigation (browser Back / Forward buttons), preserve history scroll position
    if (navType === 'POP') {
      return;
    }

    // If route contains a section hash (e.g. /#past-events, /#announcements), scroll to anchor
    if (hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    // On PUSH/REPLACE navigation (clicking any route or footer link), scroll to top immediately
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname, hash, navType]);

  return null;
}
