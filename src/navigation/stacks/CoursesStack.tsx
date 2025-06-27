import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { CoursesListScreen } from '../../screens/course/CoursesListScreen';
import { CourseDetailScreen } from '../../screens/course/CourseDetailScreen';
import { AddContentScreen } from '../../screens/course/AddContentScreen';
import { ReviewTopicsScreen } from '../../screens/course/ReviewTopicsScreen';
import { useCourseStore } from '../../stores/courseStore';
import { Course } from '../../types';
import { ExtractedTopic } from '../../services/openai/topicExtraction';

export type CoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: { course: Course };
  AddContent: { course: Course };
  ReviewTopics: { 
    course: Course; 
    topics: ExtractedTopic[]; 
  };
};

const Stack = createStackNavigator<CoursesStackParamList>();

// Courses List Screen Wrapper
interface CoursesListScreenWrapperProps {
  navigation: any;
}

const CoursesListScreenWrapper: React.FC<CoursesListScreenWrapperProps> = ({ navigation }) => (
  <CoursesListScreen 
    onCreateCourse={() => {
      // Navigate to Create tab's course creation flow
      navigation.getParent()?.navigate('Create', {
        screen: 'CreateCourse'
      });
    }}
    onCoursePress={(course) => {
      // Navigate to course detail
      navigation.navigate('CourseDetail', { course });
    }}
  />
);

// Course Detail Screen Wrapper
const CourseDetailScreenWrapper: React.FC<any> = ({ route, navigation }) => {
  const { course } = route.params;
  
  return (
    <CourseDetailScreen 
      course={course}
      onBack={() => navigation.goBack()}
      onDeleted={() => navigation.goBack()}
    />
  );
};

// Add Content Screen Wrapper
const AddContentScreenWrapper: React.FC<any> = ({ route, navigation }) => {
  const { course } = route.params;
  
  return (
    <AddContentScreen 
      course={course}
      onSkip={() => {
        // Skip directly to course detail
        navigation.navigate('CourseDetail', { course });
      }}
      onComplete={(topics) => {
        // Navigate to review topics
        navigation.navigate('ReviewTopics', { course, topics });
      }}
    />
  );
};

// Review Topics Screen Wrapper - UPDATED with database integration
const ReviewTopicsScreenWrapper: React.FC<any> = ({ route, navigation }) => {
  const { course, topics } = route.params;
  const { saveTopicsForCourse, isLoadingTopics } = useCourseStore();
  
  return (
    <ReviewTopicsScreen 
      course={course}
      topics={topics}
      onBack={() => {
        // Go back to Add Content
        navigation.goBack();
      }}
      onSave={async (finalTopics) => {
        try {
          // Show loading state
          const success = await saveTopicsForCourse(course.id, finalTopics);
          
          if (success) {
            // Success - navigate to course detail
            Alert.alert(
              'Topics Saved!', 
              `Successfully saved ${finalTopics.length} topics for "${course.name}".`,
              [
                { 
                  text: 'View Course', 
                  onPress: () => {
                    // Navigate to course detail with updated course
                    navigation.navigate('CourseDetail', { 
                      course: { ...course, topicsExtracted: true }
                    });
                  }
                }
              ]
            );
          } else {
            // Error - stay on current screen, error is handled by store
            Alert.alert(
              'Save Failed', 
              'Failed to save topics. Please try again.',
              [{ text: 'OK' }]
            );
          }
        } catch (error: any) {
          console.error('Error saving topics:', error);
          Alert.alert(
            'Save Failed', 
            'An unexpected error occurred. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }}
      onCancel={() => {
        // Navigate to course detail, discarding changes
        Alert.alert(
          'Discard Topics?',
          'Are you sure you want to discard these topics? They will not be saved.',
          [
            { text: 'Keep Editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                navigation.navigate('CourseDetail', { course });
              }
            }
          ]
        );
      }}
      // Pass loading state to show spinner during save
      isLoading={isLoadingTopics}
    />
  );
};

// Courses Stack Navigator
export const CoursesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="CoursesList"
      screenOptions={{ 
        headerShown: false 
      }}
    >
      <Stack.Screen 
        name="CoursesList" 
        component={CoursesListScreenWrapper} 
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreenWrapper} 
      />
      <Stack.Screen 
        name="AddContent" 
        component={AddContentScreenWrapper} 
      />
      <Stack.Screen 
        name="ReviewTopics" 
        component={ReviewTopicsScreenWrapper} 
      />
    </Stack.Navigator>
  );
};