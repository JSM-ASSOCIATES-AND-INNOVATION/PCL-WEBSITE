import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PremiumDropdown.module.css';
import DropdownItem from './DropdownItem';
import { DropdownColumnType, DropdownItemType } from './types';

// Recursively handles nested submenus
function SubMenuNode({ item }: { item: DropdownItemType }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={styles.subMenuWrapper}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <DropdownItem item={item} />
      
      <AnimatePresence>
        {isOpen && item.subItems && (
          <motion.div
            initial={{ opacity: 0, x: -10, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -10, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={styles.subMenuContainer}
          >
            {item.subItems.map((sub, idx) => (
              <SubMenuNode key={idx} item={sub} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DropdownMenu({ columns, onClose }: { columns: DropdownColumnType[], onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={styles.menuWrapper}
      role="menu"
      onClick={(e) => {
        // If clicking a link (not a submenu trigger), close the dropdown
        if ((e.target as HTMLElement).closest('a')) {
          onClose();
        }
      }}
    >
      <div className={styles.columnsContainer}>
        {columns.map((col, cIdx) => (
          <div key={cIdx} className={styles.column}>
            {col.title && <div className={styles.columnTitle}>{col.title}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {col.items.map((item, iIdx) => (
                item.subItems ? (
                  <SubMenuNode key={iIdx} item={item} />
                ) : (
                  <DropdownItem key={iIdx} item={item} />
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
