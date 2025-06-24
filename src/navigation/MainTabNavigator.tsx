import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize } from '../constants/theme';

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Create: undefined;
  Quizzes: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Placeholder screens
const HomeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>🏠 Home Screen</Text>
    <Text>Dashboard coming soon!</Text>
  </View>
);

const CoursesScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>📚 Courses Screen</Text>
    <Text>Course management coming soon!</Text>
  </View>
);

const CreateScreen = () => {
  const handleCreateOption = (option: string) => {
    Alert.alert('Create', `${option} creation coming soon!`);
  };

  return (
    <View style={styles.createContainer}>
      <Text style={styles.createTitle}>Create New</Text>
      <Text style={styles.createSubtitle}>What would you like to add?</Text>
      
      <View style={styles.createOptions}>
        <TouchableOpacity 
          style={styles.createOption} 
          onPress={() => handleCreateOption('Syllabus Upload')}
        >
          <Text style={styles.createOptionIcon}>📄</Text>
          <Text style={styles.createOptionText}>Upload Syllabus</Text>
          <Text style={styles.createOptionDesc}>Add course syllabus & extract topics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createOption} 
          onPress={() => handleCreateOption('Notes Upload')}
        >
          <Text style={styles.createOptionIcon}>📝</Text>
          <Text style={styles.createOptionText}>Upload Notes</Text>
          <Text style={styles.createOptionDesc}>Add study materials & documents</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createOption} 
          onPress={() => handleCreateOption('Task Creation')}
        >
          <Text style={styles.createOptionIcon}>✅</Text>
          <Text style={styles.createOptionText}>Add Task</Text>
          <Text style={styles.createOptionDesc}>Create assignment or deadline</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.createOption} 
          onPress={() => handleCreateOption('Course Creation')}
        >
          <Text style={styles.createOptionIcon}>🎓</Text>
          <Text style={styles.createOptionText}>New Course</Text>
          <Text style={styles.createOptionDesc}>Set up a new course</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QuizzesScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>📝 Daily Quizzes</Text>
    <Text>Today's quizzes from all courses!</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>👤 Profile Screen</Text>
    <Text>Profile settings coming soon!</Text>
  </View>
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
        component={CoursesScreen}
        options={{ 
          tabBarLabel: 'Courses',
          tabBarIcon: () => <Text style={styles.tabIcon}>📚</Text>
        }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateScreen}
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

  // Create screen styles
  createContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  createTitle: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  createSubtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  createOptions: {
    gap: spacing.md,
  },
  createOption: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  createOptionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  createOptionText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  createOptionDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});