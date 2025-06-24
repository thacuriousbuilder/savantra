
import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Initialize auth on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading or auth check
  if (isLoading) {
    // TODO: Add a proper loading screen later
    return null;
  }

  // Conditional navigation based on auth status
  if (isAuthenticated) {
    return <MainTabNavigator />;
  } else {
    return <AuthNavigator />;
  }
};