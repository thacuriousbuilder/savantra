
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { TopicExtractionService, ExtractedTopic } from '../../services/openai/topicExtraction';

export const TopicExtractionTest: React.FC = () => {
  const [syllabusText, setSyllabusText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState<ExtractedTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Sample syllabus data for quick testing
  const sampleSyllabus = `Computer Science 101 - Introduction to Programming

Course Description:
This course provides an introduction to computer programming using Python. Students will learn fundamental programming concepts, data structures, and problem-solving techniques.

Learning Objectives:
- Understand basic programming concepts
- Write and debug Python programs
- Implement data structures and algorithms
- Apply object-oriented programming principles

Course Topics:
Week 1-2: Introduction to Programming and Python Basics
Week 3-4: Variables, Data Types, and Operators
Week 5-6: Control Structures (if/else, loops)
Week 7-8: Functions and Modules
Week 9-10: Lists, Tuples, and Dictionaries
Week 11-12: Object-Oriented Programming
Week 13-14: File I/O and Exception Handling
Week 15-16: Final Projects and Review

Assessment:
- Programming Assignments (40%)
- Midterm Exam (25%)
- Final Exam (25%)
- Class Participation (10%)`;

  // Load sample data
  const loadSampleData = () => {
    setSyllabusText(sampleSyllabus);
    setError(null);
    setExtractedTopics([]);
  };

  // Clear all data
  const clearData = () => {
    setSyllabusText('');
    setExtractedTopics([]);
    setError(null);
    setProcessingTime(null);
  };

  // Extract topics using the service
  const extractTopics = async () => {
    if (!syllabusText.trim()) {
      Alert.alert('Empty Input', 'Please enter or load syllabus text first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setExtractedTopics([]);

    try {
      const result = await TopicExtractionService.extractTopics(syllabusText);

      if (result.success) {
        setExtractedTopics(result.topics);
        setProcessingTime(result.metadata?.processingTime || null);
        Alert.alert(
          'Success!', 
          `Extracted ${result.topics.length} topics in ${result.metadata?.processingTime}ms`
        );
      } else {
        setError(result.error || 'Unknown error occurred');
        Alert.alert('Extraction Failed', result.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unexpected error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Test with built-in sample data
  const testWithSample = async () => {
    setIsProcessing(true);
    setError(null);
    setExtractedTopics([]);

    try {
      const result = await TopicExtractionService.testWithSampleData();

      if (result.success) {
        setExtractedTopics(result.topics);
        setProcessingTime(result.metadata?.processingTime || null);
        Alert.alert(
          'Sample Test Success!', 
          `Extracted ${result.topics.length} topics from sample data`
        );
      } else {
        setError(result.error || 'Sample test failed');
        Alert.alert('Sample Test Failed', result.error || 'Sample test failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Sample test error';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>🧠 AI Topic Extraction Test</Text>
          <Text style={styles.subtitle}>Test OpenAI topic extraction from syllabus text</Text>

          {/* Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Syllabus Text Input</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Paste your syllabus text here..."
              placeholderTextColor={colors.placeholder}
              value={syllabusText}
              onChangeText={setSyllabusText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.sampleButton} onPress={loadSampleData}>
                <Text style={styles.sampleButtonText}>Load Sample</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearButton} onPress={clearData}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Processing Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Extract Topics</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.extractButton, isProcessing && styles.buttonDisabled]}
                onPress={extractTopics}
                disabled={isProcessing}
              >
                <Text style={styles.extractButtonText}>
                  {isProcessing ? 'Processing...' : 'Extract Topics'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, isProcessing && styles.buttonDisabled]}
                onPress={testWithSample}
                disabled={isProcessing}
              >
                <Text style={styles.testButtonText}>
                  {isProcessing ? 'Testing...' : 'Test Sample'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Character count */}
            <Text style={styles.charCount}>
              Characters: {syllabusText.length} / 8000
            </Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>❌ Error</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results Section */}
          {extractedTopics.length > 0 && (
            <View style={styles.section}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>3. Extracted Topics</Text>
                {processingTime && (
                  <Text style={styles.processingTime}>
                    {processingTime}ms
                  </Text>
                )}
              </View>

              <Text style={styles.topicCount}>
                Found {extractedTopics.length} topics:
              </Text>

              {extractedTopics.map((topic, index) => (
                <View key={topic.id} style={styles.topicCard}>
                  <View style={styles.topicHeader}>
                    <Text style={styles.topicNumber}>{index + 1}.</Text>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                  </View>
                  
                  {topic.keywords && topic.keywords.length > 0 && (
                    <View style={styles.keywordsContainer}>
                      {topic.keywords.map((keyword, keyIndex) => (
                        <View key={keyIndex} style={styles.keywordTag}>
                          <Text style={styles.keywordText}>{keyword}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📋 Testing Instructions</Text>
            <Text style={styles.instructionText}>1. Load sample data or paste your own syllabus</Text>
            <Text style={styles.instructionText}>2. Click "Extract Topics" to process with OpenAI</Text>
            <Text style={styles.instructionText}>3. Review the extracted topics and keywords</Text>
            <Text style={styles.instructionText}>4. Try "Test Sample" to use built-in sample data</Text>
            <Text style={styles.warningText}>
              ⚠️ Requires OpenAI API key to be configured
            </Text>
          </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    minHeight: 120,
    maxHeight: 200,
  },
  inputActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  sampleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  sampleButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  extractButton: {
    flex: 2,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  extractButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  charCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    lineHeight: 18,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  processingTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  topicCount: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  topicCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  topicNumber: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.sm,
    minWidth: 20,
  },
  topicTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  keywordTag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  keywordText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  instructionsTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: '#f57c00',
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});