import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

// Error Banner - Shows at top of screen for temporary errors
interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onDismiss,
  onRetry,
  type = 'error',
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'warning': return '#FEF3C7'; // Light yellow
      case 'info': return '#DBEAFE'; // Light blue
      default: return '#FEE2E2'; // Light red
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning': return '#92400E'; // Dark yellow
      case 'info': return '#1E40AF'; // Dark blue
      default: return '#DC2626'; // Dark red
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❌';
    }
  };

  return (
    <View style={[styles.banner, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.bannerContent}>
        <Text style={styles.bannerIcon}>{getIcon()}</Text>
        <Text style={[styles.bannerText, { color: getTextColor() }]} numberOfLines={2}>
          {message}
        </Text>
      </View>
      
      <View style={styles.bannerActions}>
        {onRetry && (
          <TouchableOpacity style={styles.bannerButton} onPress={onRetry}>
            <Text style={[styles.bannerButtonText, { color: getTextColor() }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity style={styles.bannerButton} onPress={onDismiss}>
            <Text style={[styles.bannerButtonText, { color: getTextColor() }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Network Error Component - Full screen network error state
interface NetworkErrorProps {
  onRetry: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = "Unable to connect to server. Please check your internet connection.",
}) => {
  return (
    <View style={styles.networkErrorContainer}>
      <Text style={styles.networkErrorIcon}>📡</Text>
      <Text style={styles.networkErrorTitle}>Connection Error</Text>
      <Text style={styles.networkErrorMessage}>{message}</Text>
      
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

// Loading Error Component - Shows during failed loading states
interface LoadingErrorProps {
  message: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <View style={styles.loadingErrorContainer}>
      <View style={styles.loadingErrorContent}>
        <Text style={styles.loadingErrorIcon}>⚠️</Text>
        <Text style={styles.loadingErrorTitle}>Something went wrong</Text>
        <Text style={styles.loadingErrorMessage}>{message}</Text>
        
        <View style={styles.loadingErrorActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onRetry}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </TouchableOpacity>
          
          {onDismiss && (
            <TouchableOpacity style={styles.primaryButton} onPress={onDismiss}>
              <Text style={styles.primaryButtonText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Inline Error Component - Small error messages within forms/components
interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.inlineErrorContainer}>
      <Text style={styles.inlineErrorIcon}>⚠️</Text>
      <Text style={styles.inlineErrorText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.inlineRetryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Error Alert Helper - For showing alerts with retry option
export const showErrorAlert = (
  title: string,
  message: string,
  onRetry?: () => void,
  onCancel?: () => void
) => {
  const buttons: Array<{
    text: string;
    style: 'cancel' | 'default' | 'destructive';
    onPress?: () => void;
  }> = [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: onCancel,
    },
  ];

  if (onRetry) {
    buttons.push({
      text: 'Retry',
      style: 'default',
      onPress: onRetry,
    });
  }

  Alert.alert(title, message, buttons);
};

const styles = StyleSheet.create({
  // Error Banner Styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  bannerText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bannerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  bannerButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // Network Error Styles
  networkErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  networkErrorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  networkErrorTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  networkErrorMessage: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },

  // Loading Error Styles
  loadingErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingErrorContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  loadingErrorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  loadingErrorTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  loadingErrorMessage: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  loadingErrorActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },

  // Inline Error Styles
  inlineErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  inlineErrorIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  inlineErrorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#DC2626',
  },
  inlineRetryText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
});