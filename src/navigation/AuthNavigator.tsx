
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false // Hide default header since our screens have custom headers
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreenWrapper} />
      <Stack.Screen name="Login" component={LoginScreenWrapper} />
      <Stack.Screen name="SignUp" component={SignUpScreenWrapper} />
    </Stack.Navigator>
  );
};

// Wrapper components to handle navigation
const WelcomeScreenWrapper: React.FC<any> = ({ navigation }) => (
  <WelcomeScreen 
    onLogin={() => navigation.navigate('Login')}
    onSignUp={() => navigation.navigate('SignUp')}
  />
);

const LoginScreenWrapper: React.FC<any> = ({ navigation }) => (
  <LoginScreen 
    onBack={() => navigation.navigate('Welcome')}
    onSignUp={() => navigation.navigate('SignUp')}
    onLoginSuccess={() => {
      // Auth store will handle the navigation automatically
      console.log('Login successful!');
    }}
  />
);

const SignUpScreenWrapper: React.FC<any> = ({ navigation }) => (
  <SignUpScreen 
    onBack={() => navigation.navigate('Welcome')}
    onLogin={() => navigation.navigate('Login')}
    onSignUpSuccess={() => {
      // Auth store will handle the navigation automatically
      console.log('Sign up successful!');
    }}
  />
);