/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React from 'react';
import styles from './PremiumCard.module.css';

export default function SkeletonCard() {
  return (
    <div className={styles.cardWrapper}>
      <div className={`${styles.card} ${styles.skeletonCard}`}>
        {/* Left Side: Image */}
        <div className={styles.imageContainer}>
          <div className={`${styles.skImage} ${styles.shimmer}`} />
        </div>

        {/* Right Side: Body */}
        <div className={styles.bodyContainer}>
          
          <div className={styles.headerRow}>
            <div className={`${styles.titleWrapper} w-full`}>
              <div className={`${styles.skTitle} ${styles.shimmer}`} />
              <div className={`${styles.skSubtitle} ${styles.shimmer}`} />
            </div>
          </div>

          <div className={`${styles.skDesc} ${styles.shimmer}`} />
          <div className={`${styles.skDesc} ${styles.shimmer}`} />
          <div className={`${styles.skDescShort} ${styles.shimmer}`} />

          <div className={`${styles.statsGrid}`}>
             <div className={`${styles.skStatBlock} ${styles.shimmer}`} />
             <div className={`${styles.skStatBlock} ${styles.shimmer}`} />
             <div className={`${styles.skStatBlock} ${styles.shimmer}`} />
          </div>

          <div className={styles.footerContainer}>
            <div className={`${styles.skBtn} ${styles.shimmer}`} />
            <div className={`${styles.skBtn} ${styles.shimmer}`} />
          </div>

        </div>
      </div>
    </div>
  );
}
