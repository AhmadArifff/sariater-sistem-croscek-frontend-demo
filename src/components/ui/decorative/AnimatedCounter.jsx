import React, { useState, useEffect } from 'react';

/**
 * AnimatedCounter - Animated number counter
 * @param {number} from - Starting number
 * @param {number} to - Ending number
 * @param {number} duration - Animation duration in ms
 * @param {string} suffix - Text suffix (e.g., '%', 'K')
 * @param {string} prefix - Text prefix (e.g., '$')
 * @param {string} className - Additional Tailwind classes
 */
export const AnimatedCounter = ({
  from = 0,
  to = 100,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = '',
  decimals = 0
}) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const current = Math.floor(from + (to - from) * progress);
      setCount(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : count;

  return (
    <span className={`font-bold tabular-nums ${className}`}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;
