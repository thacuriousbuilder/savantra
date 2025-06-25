import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CoursesListScreen } from '../../screens/course/CoursesListScreen';
import { CourseDetailScreen } from '../../screens/course/CourseDetailScreen';
import { Course } from '../../types';

export type CoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: { course: Course };
  // Future: CourseEdit, etc.
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
    </Stack.Navigator>
  );
};