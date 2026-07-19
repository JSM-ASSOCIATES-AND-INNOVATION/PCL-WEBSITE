/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { useEffect } from 'react';

export function useKeyboardNavigation(isOpen: boolean, closeMenu: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
      // Future: Add ArrowUp and ArrowDown logic to cycle through tabIndex=0 elements
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);
}
