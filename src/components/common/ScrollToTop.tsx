import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there is no hash, scroll to top
    if (!hash) {
      window.scrollTo(0, 0);
    } 
    // If there is a hash, we let the element-specific scrolling logic handle it 
    // (like in Home.tsx or Navbar.tsx)
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
