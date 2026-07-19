/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import styles from './PremiumDropdown.module.css';
import DropdownMenu from './DropdownMenu';
import { DropdownMenuType } from './types';
import { useClickOutside } from './hooks/useClickOutside';
import { Link } from 'react-router-dom';

interface PremiumDropdownProps {
  label: string;
  link?: string;
  menu: DropdownMenuType;
  isActive?: boolean;
}

export default function PremiumDropdown({ label, link, menu, isActive }: PremiumDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom hook for clicking outside
  const ref = useClickOutside(() => setIsOpen(false));

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div 
      className={styles.dropdownContainer} 
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {link ? (
          <Link 
            to={link} 
            className={styles.triggerBtn} 
            style={{ color: isActive ? '#FFBF00' : 'inherit' }}
            onClick={() => setIsOpen(false)}
          >
            {label}
          </Link>
        ) : (
          <button 
            className={styles.triggerBtn}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            {label}
          </button>
        )}
        
        <button 
          className={styles.triggerBtn} 
          style={{ paddingLeft: 0, marginLeft: '-4px' }}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <ChevronDown size={14} className={`${styles.triggerIcon} ${isOpen ? styles.open : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu 
            columns={menu.columns} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
