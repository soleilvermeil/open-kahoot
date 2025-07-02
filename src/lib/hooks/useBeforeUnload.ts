import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseBeforeUnloadOptions {
  enabled: boolean;
  message?: string;
}

export function useBeforeUnload({ enabled, message = 'You have unsaved changes. Are you sure you want to leave?' }: UseBeforeUnloadOptions) {
  const router = useRouter();
  const isNavigatingRef = useRef(false);
  const lastHistoryLength = useRef<number | null>(null);

  const showConfirmation = useCallback(() => {
    if (!enabled || isNavigatingRef.current) return true;
    return window.confirm(message);
  }, [enabled, message]);

  useEffect(() => {
    if (!enabled) return;

    // Handle browser navigation (back button, closing tab, etc.)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    // Handle browser history navigation (back/forward)
    const handlePopState = () => {
      if (!showConfirmation()) {
        // Try to push the user back to the current page
        if (lastHistoryLength.current !== null && window.history.length !== lastHistoryLength.current) {
          window.history.go(1); // Go forward again
        } else {
          window.history.pushState(null, '', window.location.href);
        }
      } else {
        isNavigatingRef.current = true;
      }
    };

    // Handle clicks on Link components
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
        // Check if it's an internal navigation
        const currentOrigin = window.location.origin;
        if (link.href.startsWith(currentOrigin)) {
          const confirmed = showConfirmation();
          if (!confirmed) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          isNavigatingRef.current = true;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick, true);
    lastHistoryLength.current = window.history.length;

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [enabled, message, showConfirmation]);

  // Wrapper for router.push that includes confirmation
  const safePush = useCallback((href: string, options?: { scroll?: boolean }) => {
    const confirmed = showConfirmation();
    if (!confirmed) {
      return Promise.resolve(false);
    }
    isNavigatingRef.current = true;
    return router.push(href, options);
  }, [router, showConfirmation]);

  // Function to manually clear the navigation flag (useful when navigating intentionally)
  const clearNavigationFlag = useCallback(() => {
    isNavigatingRef.current = false;
  }, []);

  return { 
    clearNavigationFlag,
    safePush,
    showConfirmation
  };
} 