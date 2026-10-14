import { useEffect } from 'react';

/**
 * Global reference-counted body scroll lock to prevent background scrolling
 * when one or more modals/popups are open, supporting both desktop and mobile iOS/Android.
 */
let lockCount = 0;
let originalBodyOverflow = '';
let originalDocOverflow = '';
let originalPaddingRight = '';
let originalBodyOverscroll = '';
let originalDocOverscroll = '';

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      // Save original values on the first lock
      originalBodyOverflow = document.body.style.overflow;
      originalDocOverflow = document.documentElement.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;
      originalBodyOverscroll = document.body.style.overscrollBehavior;
      originalDocOverscroll = document.documentElement.style.overscrollBehavior;

      // Compensate for desktop scrollbar width to prevent layout jump
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Lock scrolling on both body and document element
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        // Restore only when all modals are closed
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalDocOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        document.body.style.overscrollBehavior = originalBodyOverscroll;
        document.documentElement.style.overscrollBehavior = originalDocOverscroll;
      }
    };
  }, [isLocked]);
};
