import { useState, useCallback } from 'react';
import { showErrorAlert } from '../components/common/ErrorComponent';

export interface ErrorState {
  message: string | null;
  type: 'network' | 'validation' | 'server' | 'unknown';
  isVisible: boolean;
}

export const useErrorHandler = () => {
  const [error, setError] = useState<ErrorState>({
    message: null,
    type: 'unknown',
    isVisible: false,
  });

  // Detect error type from message
  const detectErrorType = (errorMessage: string): ErrorState['type'] => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || message.includes('internet')) {
      return 'network';
    }
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('server') || message.includes('database') || message.includes('auth')) {
      return 'server';
    }
    return 'unknown';
  };

  // Show error with automatic type detection
  const showError = useCallback((message: string, type?: ErrorState['type']) => {
    setError({
      message,
      type: type || detectErrorType(message),
      isVisible: true,
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError({
      message: null,
      type: 'unknown',
      isVisible: false,
    });
  }, []);

  // Show error alert with retry option
  const showErrorWithRetry = useCallback((
    title: string,
    message: string,
    onRetry?: () => void
  ) => {
    showErrorAlert(
      title,
      message,
      () => {
        clearError();
        onRetry?.();
      },
      clearError
    );
  }, [clearError]);

  // Handle course store errors
  const handleStoreError = useCallback((
    storeError: string | null,
    operation: string,
    onRetry?: () => void
  ) => {
    if (!storeError) return;

    const isNetworkError = storeError.toLowerCase().includes('network');
    
    if (isNetworkError && onRetry) {
      showErrorWithRetry(
        'Connection Error',
        `Unable to ${operation}. Please check your internet connection.`,
        onRetry
      );
    } else {
      showError(storeError);
    }
  }, [showError, showErrorWithRetry]);

  // Get user-friendly error message
  const getFriendlyErrorMessage = useCallback((errorMessage: string): string => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('connection')) {
      return 'Please check your internet connection and try again.';
    }
    if (message.includes('not authenticated') || message.includes('unauthorized')) {
      return 'Please log in again to continue.';
    }
    if (message.includes('not found')) {
      return 'The requested item could not be found.';
    }
    if (message.includes('validation') || message.includes('required')) {
      return 'Please check your input and try again.';
    }
    if (message.includes('server') || message.includes('database')) {
      return 'Server error. Please try again later.';
    }
    
    return errorMessage; // Return original message if no pattern matches
  }, []);

  return {
    error,
    showError,
    clearError,
    showErrorWithRetry,
    handleStoreError,
    getFriendlyErrorMessage,
    
    // Convenience getters
    hasError: error.isVisible && error.message !== null,
    isNetworkError: error.type === 'network',
    isValidationError: error.type === 'validation',
    isServerError: error.type === 'server',
  };
};