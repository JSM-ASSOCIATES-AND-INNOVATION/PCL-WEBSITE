/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState } from 'react';
import styles from './PremiumCard.module.css';
import { ButtonProps } from './types';

export default function Button({ 
  variant = 'primary', 
  icon, 
  children, 
  className = '', 
  onClick, 
  ...props 
}: ButtonProps) {
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 600); // Wait for CSS animation
    if (onClick) onClick(e);
  };

  const variantClass = variant === 'primary' ? styles.btnPrimary : styles.btnSecondary;

  return (
    <button 
      className={`${styles.btn} ${variantClass} ${className}`} 
      onClick={handleClick}
      {...props}
    >
      {isRippling && (
        <span
          className={styles.ripple}
          style={{
            left: coords.x,
            top: coords.y,
            width: 20, // arbitrary start size
            height: 20,
          }}
        />
      )}
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
}
