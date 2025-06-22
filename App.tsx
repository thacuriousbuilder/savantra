
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WelcomeScreen } from './src/screens/auth/WelcomeScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { SignUpScreen } from './src/screens/auth/SignUpScreen';

type Screen = 'welcome' | 'login' | 'signup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToSignUp = () => setCurrentScreen('signup');
  const navigateToWelcome = () => setCurrentScreen('welcome');
  
  const onLoginSuccess = () => {
    console.log('Login successful! Navigate to main app');
    // For now, just log - later we'll navigate to main app
  };

  const onSignUpSuccess = () => {
    console.log('Sign up successful! Navigate to main app');
    // For now, just log - later we'll navigate to main app
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onLogin={navigateToLogin}
          onSignUp={navigateToSignUp}
        />
      )}
      
      {currentScreen === 'login' && (
        <LoginScreen 
          onBack={navigateToWelcome}
          onSignUp={navigateToSignUp}
          onLoginSuccess={onLoginSuccess}
        />
      )}

      {currentScreen === 'signup' && (
        <SignUpScreen 
          onBack={navigateToWelcome}
          onLogin={navigateToLogin}
          onSignUpSuccess={onSignUpSuccess}
        />
      )}
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});