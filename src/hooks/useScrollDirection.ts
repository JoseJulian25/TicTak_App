import { useState, useEffect, useRef } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const scrollContainer = document.querySelector('main');

    if (!scrollContainer) {
      return;
    }

    const updateScrollDirection = () => {
      const scrollY = scrollContainer.scrollTop;

      if (Math.abs(scrollY - lastScrollY.current) < 10) {
        ticking.current = false;
        return;
      }

      const newDirection = scrollY > lastScrollY.current ? "down" : "up";
      
      setScrollDirection(newDirection);
      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    scrollContainer.addEventListener("scroll", onScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
    };
  }, []); // Sin dependencias - solo se ejecuta una vez

  return scrollDirection;
}
