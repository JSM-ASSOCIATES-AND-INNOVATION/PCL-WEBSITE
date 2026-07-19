import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './PremiumDropdown.module.css';
import { DropdownItemType } from './types';

interface Props {
  item: DropdownItemType;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function DropdownItem({ item, onMouseEnter, onMouseLeave }: Props) {
  const content = (
    <>
      <div className={styles.itemLabel}>
        {item.icon && <span>{item.icon}</span>}
        <span>{item.label}</span>
        {item.badge && <span className={styles.badge}>{item.badge}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
        {item.subItems && <ChevronRight size={14} className="text-gray-400" />}
      </div>
    </>
  );

  const elementProps = {
    className: styles.item,
    onMouseEnter,
    onMouseLeave,
    role: 'menuitem',
    tabIndex: 0,
    ...(item.disabled && { 'aria-disabled': true, style: { opacity: 0.5, cursor: 'not-allowed' } })
  };

  if (item.link) {
    return (
      <Link to={item.link} {...elementProps}>
        {content}
      </Link>
    );
  }

  return (
    <div {...elementProps}>
      {content}
    </div>
  );
}
