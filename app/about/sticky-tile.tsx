"use client"

import { useRef, useEffect, useState } from 'react';

export function StickyTile({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { top, bottom, height } = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        setContainerHeight(height);

        if (top <= 0 && bottom >= windowHeight) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    handleScroll(); // Initial call to set the container height
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: `${containerHeight}px` }}>
      <div
        className={`${
          isSticky ? 'fixed top-0 left-0 right-0' : 'absolute top-0 left-0 right-0'
        } h-screen`}
      >
        {children}
      </div>
    </div>
  );
}