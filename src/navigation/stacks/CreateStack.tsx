import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CreateCourseScreen } from '../../screens/course/createCourseScreen';

export type CreateStackParamList = {
  CreateOptions: undefined;
  CreateCourse: undefined;
  // Future: CreateNotes, CreateTask, etc.
};

const Stack = createStackNavigator<CreateStackParamList>();

// Create Options Screen (your existing Create tab content)
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize } from '../../constants/theme';

interface CreateOptionsScreenProps {
  navigation: any;
}

const CreateOptionsScreen: React.FC<CreateOptionsScreenProps> = ({ navigation }) => {
  const handleCreateOption = (option: string) => {
    switch (option) {
      case 'Course':
        navigation.navigate('CreateCourse');
        break;
      case 'Syllabus':
      case 'Notes':
      case 'Task':
        Alert.alert('Coming Soon', `${option} creation will be available soon!`);
        break;
      default:
        Alert.alert('Create', `${option} creation coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New</Text>
      <Text style={styles.subtitle}>What would you like to add?</Text>
      
      <View style={styles.options}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => handleCreateOption('Course')}
        >
          <Text style={styles.optionIcon}>🎓</Text>
          <Text style={styles.optionText}>New Course</Text>
          <Text style={styles.optionDesc}>Set up a new course for quizzes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option} 
          onPress={() => handleCreateOption('Syllabus')}
        >
          <Text style={styles.optionIcon}>📄</Text>
          <Text style={styles.optionText}>Upload Syllabus</Text>
          <Text style={styles.optionDesc}>Add course syllabus & extract topics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option} 
          onPress={() => handleCreateOption('Notes')}
        >
          <Text style={styles.optionIcon}>📝</Text>
          <Text style={styles.optionText}>Upload Notes</Text>
          <Text style={styles.optionDesc}>Add study materials & documents</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option} 
          onPress={() => handleCreateOption('Task')}
        >
          <Text style={styles.optionIcon}>✅</Text>
          <Text style={styles.optionText}>Add Task</Text>
          <Text style={styles.optionDesc}>Create assignment or deadline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Create Course Screen Wrapper
const CreateCourseScreenWrapper: React.FC<any> = ({ navigation }) => (
  <CreateCourseScreen 
    onBack={() => navigation.goBack()}
    onSuccess={(courseId) => {
      // Navigate to Courses tab to show the newly created course
      navigation.getParent()?.navigate('Courses', {
        screen: 'CoursesList'
      });
    }}
  />
);

// Stack Navigator
export const CreateStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="CreateOptions"
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen 
        name="CreateOptions" 
        component={CreateOptionsScreen} 
      />
      <Stack.Screen 
        name="CreateCourse" 
        component={CreateCourseScreenWrapper} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});