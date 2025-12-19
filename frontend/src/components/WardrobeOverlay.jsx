import { useEffect, useState } from 'react';

const WardrobeOverlay = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    // Add 'open' class to trigger animation
    const overlay = document.getElementById('wardrobe-overlay');
    if (overlay) {
      setTimeout(() => {
        overlay.classList.add('open');
      }, 100);
      
      // Fade out after 2 seconds
      setTimeout(() => {
        overlay.classList.add('fade-out');
      }, 2000);
    }

    // Remove from DOM after animation
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!showOverlay) return null;

  return (
    <div id="wardrobe-overlay">
      <div className="door left-door"></div>
      <div className="door right-door"></div>
    </div>
  );
};

export default WardrobeOverlay;

