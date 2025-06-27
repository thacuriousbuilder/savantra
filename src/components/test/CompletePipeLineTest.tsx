// File: src/components/test/CompletePipelineTest.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FileUploadComponent, UploadedFile, UploadState } from '../common/FileUploadComponent';
import { FileReaderService, FileReadResult } from '../../services/files/fileReader';
import { TopicExtractionService, ExtractedTopic } from '../../services/openai/topicExtraction';

type ProcessingStep = 'idle' | 'reading' | 'extracting' | 'complete' | 'error';

interface ProcessingResult {
  fileResult?: FileReadResult;
  topicsResult?: ExtractedTopic[];
  error?: string;
  totalTime?: number;
}

export const CompletePipelineTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [processingResult, setProcessingResult] = useState<ProcessingResult>({});
  const [progress, setProgress] = useState(0);
  const [processingLog, setProcessingLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setProcessingLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  const clearLog = () => {
    setProcessingLog([]);
  };

  // Handle file selection
  const handleFileSelected = (file: UploadedFile) => {
    setSelectedFile(file);
    setUploadState('idle');
    setProcessingStep('idle');
    setProcessingResult({});
    setProgress(0);
    addLog(`📁 File selected: ${file.name} (${formatFileSize(file.size)})`);
  };

  // Complete pipeline: File → Read Text → Extract Topics
  const processCompletePipeline = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    const totalStartTime = Date.now();
    setUploadState('uploading');
    setProcessingStep('reading');
    setProgress(0);
    setProcessingResult({});
    addLog('🚀 Starting complete pipeline...');

    try {
      // Step 1: Read file text
      addLog('📖 Reading file content...');
      setProgress(20);
      
      const fileInfo = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      };

      const fileResult = await FileReaderService.readFileText(fileInfo);
      
      if (!fileResult.success) {
        throw new Error(fileResult.error || 'Failed to read file');
      }

      addLog(`✅ File read successfully (${fileResult.text?.length} characters)`);
      setProgress(50);
      setProcessingStep('extracting');

      // Step 2: Extract topics with AI
      addLog('🧠 Extracting topics with AI...');
      
      if (!fileResult.text) {
        throw new Error('No text extracted from file');
      }

      const topicsResult = await TopicExtractionService.extractTopics(fileResult.text);
      
      if (!topicsResult.success) {
        throw new Error(topicsResult.error || 'Failed to extract topics');
      }

      const totalTime = Date.now() - totalStartTime;
      
      // Success!
      setProgress(100);
      setProcessingStep('complete');
      setUploadState('success');
      
      setProcessingResult({
        fileResult,
        topicsResult: topicsResult.topics,
        totalTime,
      });

      addLog(`🎉 Pipeline completed successfully!`);
      addLog(`📊 Extracted ${topicsResult.topics.length} topics in ${totalTime}ms`);
      
      Alert.alert(
        'Success!', 
        `Complete pipeline successful!\n\nFile: ${fileResult.metadata?.textLength} characters\nTopics: ${topicsResult.topics.length}\nTime: ${totalTime}ms`
      );

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      setProcessingStep('error');
      setUploadState('error');
      setProgress(0);
      setProcessingResult({ error: errorMessage });
      
      addLog(`❌ Pipeline failed: ${errorMessage}`);
      Alert.alert('Pipeline Failed', errorMessage);
    }
  };

  // Test individual components
  const testFileReading = async () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    setProcessingStep('reading');
    addLog('🧪 Testing file reading only...');

    try {
      const fileInfo = {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      };

      const result = await FileReaderService.readFileText(fileInfo);
      
      if (result.success) {
        addLog(`✅ File reading test successful (${result.text?.length} characters)`);
        Alert.alert('File Reading Success', `Extracted ${result.text?.length} characters from ${result.metadata?.fileName}`);
      } else {
        addLog(`❌ File reading test failed: ${result.error}`);
        Alert.alert('File Reading Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      addLog(`💥 File reading test error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setProcessingStep('idle');
    }
  };

  const testSampleFile = async () => {
    setProcessingStep('reading');
    addLog('🧪 Testing with built-in sample file...');

    try {
      const result = await FileReaderService.testWithSampleFile();
      
      if (result.success) {
        addLog(`✅ Sample file test successful (${result.text?.length} characters)`);
        
        // Also test AI extraction with sample text
        if (result.text) {
          addLog('🧠 Testing AI extraction with sample text...');
          const topicsResult = await TopicExtractionService.extractTopics(result.text);
          
          if (topicsResult.success) {
            addLog(`🎉 Complete sample test successful! ${topicsResult.topics.length} topics extracted`);
            Alert.alert('Complete Test Success', `Sample pipeline worked!\nTopics: ${topicsResult.topics.length}`);
          }
        }
      } else {
        addLog(`❌ Sample file test failed: ${result.error}`);
        Alert.alert('Sample Test Failed', result.error || 'Unknown error');
      }
    } catch (error: any) {
      addLog(`💥 Sample test error: ${error.message}`);
      Alert.alert('Error', error.message);
    } finally {
      setProcessingStep('idle');
    }
  };

  // Reset everything
  const resetTest = () => {
    setSelectedFile(null);
    setProcessingStep('idle');
    setUploadState('idle');
    setProcessingResult({});
    setProgress(0);
    addLog('🔄 Test reset');
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isProcessing = processingStep !== 'idle' && processingStep !== 'complete' && processingStep !== 'error';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>🔄 Complete Pipeline Test</Text>
          <Text style={styles.subtitle}>Test File Upload → Text Extraction → AI Topics</Text>

          {/* Current Status */}
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <Text style={styles.statusText}>Step: {processingStep}</Text>
            <Text style={styles.statusText}>Progress: {progress}%</Text>
            <Text style={styles.statusText}>
              File: {selectedFile ? selectedFile.name : 'None selected'}
            </Text>
          </View>

          {/* File Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Select File</Text>
            <FileUploadComponent
              onFileSelected={handleFileSelected}
              uploadState={uploadState}
              progress={progress}
              title="Upload PDF or Word Document"
              subtitle="Select syllabus file to test complete pipeline"
              disabled={isProcessing}
            />
          </View>

          {/* Test Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Test Pipeline</Text>
            
            <TouchableOpacity
              style={[styles.primaryButton, (!selectedFile || isProcessing) && styles.buttonDisabled]}
              onPress={processCompletePipeline}
              disabled={!selectedFile || isProcessing}
            >
              <Text style={styles.primaryButtonText}>
                {isProcessing ? `${processingStep}...` : 'Run Complete Pipeline'}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, (!selectedFile || isProcessing) && styles.buttonDisabled]}
                onPress={testFileReading}
                disabled={!selectedFile || isProcessing}
              >
                <Text style={styles.secondaryButtonText}>Test File Reading</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, isProcessing && styles.buttonDisabled]}
                onPress={testSampleFile}
                disabled={isProcessing}
              >
                <Text style={styles.secondaryButtonText}>Test Sample</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={resetTest}>
              <Text style={styles.resetButtonText}>Reset Test</Text>
            </TouchableOpacity>
          </View>

          {/* Processing Log */}
          <View style={styles.section}>
            <View style={styles.logHeader}>
              <Text style={styles.sectionTitle}>3. Processing Log</Text>
              <TouchableOpacity onPress={clearLog}>
                <Text style={styles.clearLogText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.logContainer}>
              {processingLog.length > 0 ? (
                processingLog.map((log, index) => (
                  <Text key={index} style={styles.logText}>{log}</Text>
                ))
              ) : (
                <Text style={styles.emptyLogText}>No activity yet...</Text>
              )}
            </View>
          </View>

          {/* Results Display */}
          {processingResult.topicsResult && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Extracted Topics</Text>
              <Text style={styles.resultsSummary}>
                Found {processingResult.topicsResult.length} topics in {processingResult.totalTime}ms
              </Text>

              {processingResult.topicsResult.map((topic, index) => (
                <View key={topic.id} style={styles.topicCard}>
                  <Text style={styles.topicTitle}>{index + 1}. {topic.title}</Text>
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
            <Text style={styles.instructionText}>1. Select a PDF or Word document</Text>
            <Text style={styles.instructionText}>2. Run complete pipeline to test end-to-end flow</Text>
            <Text style={styles.instructionText}>3. Use individual tests to debug specific steps</Text>
            <Text style={styles.instructionText}>4. Check processing log for detailed status</Text>
            <Text style={styles.warningText}>
              ⚠️ Currently uses mock file reading - real PDF/Word parsing coming next!
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
  statusContainer: {
    backgroundColor: '#e8f5e8',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#c8e6c9',
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
  statusText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
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
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clearLogText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    maxHeight: 200,
  },
  logText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  emptyLogText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  resultsSummary: {
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
    marginBottom: spacing.sm,
  },
  topicTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  keywordTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  keywordText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  instructionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: '#856404',
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});