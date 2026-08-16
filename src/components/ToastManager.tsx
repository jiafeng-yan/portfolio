import { useEffect } from 'react';
import { useToast } from './Toast';
import { ToastContainer } from './Toast';

export function ToastManager() {
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleShowToast = (event: CustomEvent) => {
      const { message, type } = event.detail;
      showToast(message, type);
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
    };
  }, [showToast]);

  return <ToastContainer />;
}
