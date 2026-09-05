/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Heart, CheckCircle2 } from 'lucide-react';
import styles from './PremiumCard.module.css';
import Button from './Button';
import { CardProps } from './types';

export default function PremiumCard({
  title,
  subtitle,
  description,
  image,
  verified = false,
  status,
  variant = 'default',
  stats,
  favorite,
  onProfile,
  onFollow,
  onMessage,
  onFavorite,
  onShare,
}: CardProps) {
  // GSAP animations will be handled at the parent level using stagger, 
  // but we can add Framer Motion for immediate hover/click micro-interactions if preferred,
  // or stick to the CSS modules hover states defined in PremiumCard.module.css

  let variantClass = '';
  switch (variant) {
    case 'glass': variantClass = styles['variant-glass']; break;
    case 'gradient': variantClass = styles['variant-gradient']; break;
    case 'outlined': variantClass = styles['variant-outlined']; break;
    case 'neobrutal': variantClass = styles['variant-neobrutal']; break;
    default: break;
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onFavorite) onFavorite();
  };

  return (
    <div className={styles.cardWrapper}>
      <div className={`${styles.card} ${variantClass} ${variant === 'gradient' ? styles['has-animated-border'] : ''}`}>
        
        {/* Left Side: Avatar/Image */}
        <div className={styles.imageContainer}>
          <img decoding="async" src={image} alt={title} className={styles.image} loading="lazy" />
          <div className={styles.imageOverlay} />
          
          {status && (
            <div className={`${styles.statusDot} ${styles[`status-${status}`]}`} title={`Status: ${status}`} />
          )}

          <button 
            className={`${styles.favoriteBtn} ${favorite ? styles.active : ''}`} 
            onClick={handleFavorite}
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={20} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Right Side: Body */}
        <div className={styles.bodyContainer}>
          
          <div className={styles.headerRow}>
            <div className={styles.titleWrapper}>
              {verified && (
                <span className={styles.verifiedBadge}>
                  <CheckCircle2 size={12} strokeWidth={3} /> Verified Faculty
                </span>
              )}
              <h2 className={styles.title}>{title}</h2>
              {subtitle && <h3 className={styles.subtitle}>{subtitle}</h3>}
            </div>
            
            <button className={styles.menuBtn} onClick={onShare} aria-label="More options">
              <MoreVertical size={20} />
            </button>
          </div>

          {description && <p className={styles.description}>{description}</p>}

          {stats && stats.length > 0 && (
            <div className={styles.statsGrid}>
              {stats.map((stat, idx) => (
                <div key={idx} className={styles.statItem}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.footerContainer}>
            {onProfile && (
              <Button variant="primary" onClick={onProfile}>
                View Profile
              </Button>
            )}
            {onMessage && (
              <Button variant="secondary" onClick={onMessage}>
                Message
              </Button>
            )}
            {onFollow && (
              <Button variant="secondary" onClick={onFollow}>
                Follow
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
