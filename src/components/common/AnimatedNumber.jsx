import { useEffect, useState, useRef } from 'react';

/**
 * Anima la transición de un número numérico o de divisa usando requestAnimationFrame.
 * `value` debe ser numérico.
 * `formatFn` es la función de formateo final.
 */
export function AnimatedNumber({ value, duration = 400, formatFn = (v) => v, className, style }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quintic
      const easeOut = 1 - Math.pow(1 - progress, 5);
      
      const currentVal = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    }

    requestAnimationFrame(step);
  }, [value, duration]);

  return <span className={className} style={style}>{formatFn(displayValue)}</span>;
}
