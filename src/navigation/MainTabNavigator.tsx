
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../constants/theme';
import { CreateStackNavigator } from './stacks/CreateStack';
import { CoursesStackNavigator } from './stacks/CoursesStack';
import { CompletePipelineTest } from '../components/test/CompletePipeLineTest';

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Create: undefined;
  Quizzes: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens (unchanged)
const HomeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>🏠 Home Screen</Text>
    <Text>Dashboard coming soon!</Text>
  </View>
);

// const CoursesScreen = () => (
//   <View style={styles.placeholder}>
//     <Text style={styles.placeholderText}>📚 Courses Screen</Text>
//     <Text>Course management coming soon!</Text>
//   </View>
// );

const QuizzesScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>📝 Daily Quizzes</Text>
    <Text>Today's quizzes from all courses!</Text>
  </View>
);

const ProfileScreen = () => (
  <CompletePipelineTest />
);

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.inputBorder,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text style={styles.tabIcon}>🏠</Text>
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesStackNavigator}
        options={{ 
          tabBarLabel: 'Courses',
          tabBarIcon: () => <Text style={styles.tabIcon}>📚</Text>
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateStackNavigator}
        options={{ 
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.createTabIcon, 
              { backgroundColor: focused ? colors.primary : colors.textSecondary }
            ]}>
              <Text style={styles.createTabIconText}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Quizzes" 
        component={QuizzesScreen}
        options={{ 
          tabBarLabel: 'Quizzes',
          tabBarIcon: () => <Text style={styles.tabIcon}>📝</Text>
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text style={styles.tabIcon}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 10,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  
  // Tab icon styles
  tabIcon: {
    fontSize: 20,
  },
  createTabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
  },
  createTabIconText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});