import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop({ behavior = 'auto' }) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Do not force scroll on back/forward so the browser can restore position
    if (navigationType === 'POP') return;

    if (behavior === 'smooth') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType, behavior]);

  return null;
}
