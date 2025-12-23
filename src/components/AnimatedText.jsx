import { useState, useEffect } from 'react';

export default function AnimatedText({ text, delay = 0, className = '', style = {} }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-block'
      }}
    >
      {text}
    </span>
  );
}

