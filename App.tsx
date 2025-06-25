// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TopicExtractionService } from './src/services/openai/topicExtraction';

TopicExtractionService.initialize(process.env.EXPO_PUBLIC_OPENAI_API_KEY || '');
export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}