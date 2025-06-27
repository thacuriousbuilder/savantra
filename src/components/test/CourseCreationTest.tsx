// src/components/testing/CourseCreationTester.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { useCourseStore } from '../../stores/courseStore';
import { createCourseSchema } from '../../schemas/courseSchema';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

export const CourseCreationTester: React.FC = () => {
  const { 
    courses, 
    isLoading, 
    createCourse, 
    fetchCourses,
    deleteCourse 
  } = useCourseStore();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Schema Validation
  const testSchemaValidation = () => {
    addTestResult('🧪 Testing Schema Validation...');
    
    // Valid data - use future date to ensure it passes
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const validData = {
      name: 'Computer Science 101',
      endDate: futureDate.toISOString().split('T')[0], // YYYY-MM-DD format
      description: 'Introduction to Computer Science'
    };
    
    try {
      const result = createCourseSchema.parse(validData);
      addTestResult('✅ Valid data passes schema validation');
      console.log('Schema validation success:', result);
    } catch (error: any) {
      addTestResult(`❌ Valid data failed schema validation: ${error.message}`);
      console.error('Schema validation error:', error);
    }

    // Invalid data tests
    const invalidTests = [
      { data: { name: '', endDate: '2024-12-31' }, test: 'Empty name' },
      { data: { name: 'CS', endDate: '2024-12-31' }, test: 'Name too short' },
      { data: { name: 'Valid Course', endDate: '2020-01-01' }, test: 'Past date' },
      { data: { name: 'Valid Course', endDate: '' }, test: 'Empty date' },
    ];

    invalidTests.forEach(({ data, test }) => {
      try {
        createCourseSchema.parse(data);
        addTestResult(`❌ ${test} should have failed but passed`);
      } catch (error) {
        addTestResult(`✅ ${test} correctly failed validation`);
      }
    });
  };

  // Test 2: Store Course Creation
  const testCourseCreation = async () => {
    addTestResult('🧪 Testing Course Store Creation...');
    
    const initialCount = courses.length;
    const testCourse = {
      name: `Test Course ${Date.now()}`,
      endDate: '2025-12-31', // Use future date
      description: 'This is a test course for validation'
    };

    try {
      const result = await createCourse(testCourse);
      
      if (result.success && result.course) {
        addTestResult('✅ Course creation API succeeded');
        addTestResult(`✅ Course ID: ${result.course.id}`);
        
        // Force a small delay and check multiple times
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          const currentCount = courses.length;
          if (currentCount > initialCount) {
            addTestResult(`✅ Course added to store (${initialCount} → ${currentCount})`);
            break;
          }
          if (i === 4) {
            addTestResult(`⚠️ Course created but store count still ${currentCount} (expected ${initialCount + 1})`);
          }
        }
      } else {
        addTestResult('❌ Course creation failed');
      }
    } catch (error) {
      addTestResult(`❌ Course creation error: ${error}`);
    }
  };

  // Test 3: Multiple Course Creation
  const testMultipleCourses = async () => {
    addTestResult('🧪 Testing Multiple Course Creation...');
    
    const testCourses = [
      { name: 'Mathematics 101', endDate: '2024-11-30', description: 'Basic Math' },
      { name: 'Physics 201', endDate: '2024-12-15', description: 'Advanced Physics' },
      { name: 'Chemistry 101', endDate: '2025-01-20', description: 'Intro Chemistry' }
    ];

    for (const course of testCourses) {
      try {
        const result = await createCourse(course);
        addTestResult(result.success ? `✅ Created: ${course.name}` : `❌ Failed: ${course.name}`);
      } catch (error) {
        addTestResult(`❌ Error creating ${course.name}: ${error}`);
      }
    }
  };

  // Test 4: Edge Cases
  const testEdgeCases = async () => {
    addTestResult('🧪 Testing Edge Cases...');
    addTestResult('ℹ️ Note: Current store is MOCK - validation happens in UI only');
    
    const initialCount = courses.length;
    
    // Very long name (store will accept, but UI form should reject)
    const longName = 'A'.repeat(150);
    try {
      const result = await createCourse({
        name: longName,
        endDate: '2024-12-31'
      });
      addTestResult(result.success ? '⚠️ Long name accepted by store (UI should validate)' : '❌ Long name rejected by store');
    } catch (error) {
      addTestResult('❌ Long name caused store error');
    }

    // Special characters (should be fine)
    try {
      const result = await createCourse({
        name: 'Course with émojis 🎓 and spëcial chars!',
        endDate: '2024-12-31'
      });
      addTestResult(result.success ? '✅ Special characters accepted' : '❌ Special characters rejected');
    } catch (error) {
      addTestResult('❌ Special characters caused error');
    }

    // Today's date (should be fine)
    const today = new Date().toISOString().split('T')[0];
    try {
      const result = await createCourse({
        name: 'Today Course',
        endDate: today
      });
      addTestResult(result.success ? '✅ Today\'s date accepted' : '❌ Today\'s date rejected');
    } catch (error) {
      addTestResult('❌ Today\'s date caused error');
    }

    // Wait and check final count
    await new Promise(resolve => setTimeout(resolve, 200));
    const finalCount = courses.length;
    addTestResult(`📊 Edge case tests added ${finalCount - initialCount} courses`);
  };

  // Test 5: Course Deletion (cleanup)
  const testCleanup = async () => {
    addTestResult('🧪 Testing Cleanup...');
    
    if (courses.length === 0) {
      addTestResult('ℹ️ No courses to delete');
      return;
    }

    try {
      for (const course of courses) {
        const success = await deleteCourse(course.id);
        addTestResult(success ? `🗑️ Deleted: ${course.name}` : `❌ Failed to delete: ${course.name}`);
      }
    } catch (error) {
      addTestResult(`❌ Cleanup error: ${error}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    addTestResult('🚀 Starting Course Creation Tests...');
    
    testSchemaValidation();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testCourseCreation();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testMultipleCourses();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testEdgeCases();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addTestResult('✨ All tests completed!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>🧪 Course Creation Tester</Text>
          <Text style={styles.subtitle}>Test the course creation functionality</Text>
          
          {/* Important Note */}
          <View style={[styles.stateContainer, { backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }]}>
            <Text style={styles.sectionTitle}>⚠️ Testing Note</Text>
            <Text style={styles.stateText}>• Store uses MOCK implementation (always succeeds)</Text>
            <Text style={styles.stateText}>• Real validation happens in UI forms</Text>
            <Text style={styles.stateText}>• Courses persist only during app session</Text>
          </View>

          {/* Current State */}
          <View style={styles.stateContainer}>
            <Text style={styles.sectionTitle}>Current State</Text>
            <Text style={styles.stateText}>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</Text>
            <Text style={styles.stateText}>Total Courses: {courses.length}</Text>
            {courses.length > 0 && (
              <View style={styles.coursesList}>
                {courses.map(course => (
                  <Text key={course.id} style={styles.courseItem}>
                    📚 {course.name} (ends: {course.endDate})
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Test Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.primaryButton} onPress={runAllTests}>
              <Text style={styles.primaryButtonText}>🚀 Run All Tests</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={testSchemaValidation}>
                <Text style={styles.secondaryButtonText}>Schema</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={testCourseCreation}>
                <Text style={styles.secondaryButtonText}>Create</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={testEdgeCases}>
                <Text style={styles.secondaryButtonText}>Edge Cases</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cleanupButton} onPress={testCleanup}>
              <Text style={styles.cleanupButtonText}>🗑️ Cleanup Test Data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearResults}>
              <Text style={styles.clearButtonText}>Clear Results</Text>
            </TouchableOpacity>
          </View>

          {/* Test Results */}
          {testResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>{result}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  stateContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stateText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  coursesList: {
    marginTop: spacing.sm,
  },
  courseItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  buttonSection: {
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cleanupButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cleanupButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  resultText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
});