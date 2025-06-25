
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { FileUploadComponent, UploadedFile, UploadState } from '../../components/common/FileUploadComponent';

export const FileUploadTestScreen: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`${timestamp}: ${result}`, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Handle file selection
  const handleFileSelected = (file: UploadedFile) => {
    setSelectedFile(file);
    addTestResult(`✅ File selected: ${file.name} (${formatFileSize(file.size)})`);
    console.log('File selected:', file);
  };

  // Simulate upload process
  const simulateUpload = () => {
    if (!selectedFile) {
      Alert.alert('No File', 'Please select a file first');
      return;
    }

    addTestResult('🚀 Starting simulated upload...');
    setUploadState('uploading');
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploadState('success');
          addTestResult('✅ Upload simulation completed successfully!');
          return 100;
        }
        
        return newProgress;
      });
    }, 200);
  };

  // Simulate upload error
  const simulateError = () => {
    addTestResult('❌ Simulating upload error...');
    setUploadState('error');
    setProgress(0);
  };

  // Reset component state
  const resetComponent = () => {
    setUploadState('idle');
    setProgress(0);
    setSelectedFile(null);
    addTestResult('🔄 Component state reset');
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    addTestResult(`❌ Upload error: ${error}`);
    console.error('Upload error:', error);
  };

  // Format file size helper
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>🧪 File Upload Component Test</Text>
          <Text style={styles.subtitle}>Test file selection, validation, and upload states</Text>

          {/* Current State Info */}
          <View style={styles.stateContainer}>
            <Text style={styles.sectionTitle}>Current State</Text>
            <Text style={styles.stateText}>Upload State: {uploadState}</Text>
            <Text style={styles.stateText}>Progress: {progress}%</Text>
            <Text style={styles.stateText}>
              Selected File: {selectedFile ? selectedFile.name : 'None'}
            </Text>
            {selectedFile && (
              <View style={styles.fileDetails}>
                <Text style={styles.fileDetailText}>📄 Type: {selectedFile.type}</Text>
                <Text style={styles.fileDetailText}>📊 Size: {formatFileSize(selectedFile.size)}</Text>
                <Text style={styles.fileDetailText}>📂 URI: {selectedFile.uri.substring(0, 50)}...</Text>
              </View>
            )}
          </View>

          {/* File Upload Component */}
          <View style={styles.componentContainer}>
            <Text style={styles.sectionTitle}>File Upload Component</Text>
            <FileUploadComponent
              onFileSelected={handleFileSelected}
              onError={handleUploadError}
              uploadState={uploadState}
              progress={progress}
              title="Upload Test Document"
              subtitle="Select PDF or Word document for testing"
            />
          </View>

          {/* Test Controls */}
          <View style={styles.controlsContainer}>
            <Text style={styles.sectionTitle}>Test Controls</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={simulateUpload}
                disabled={!selectedFile || uploadState === 'uploading'}
              >
                <Text style={styles.primaryButtonText}>Simulate Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.errorButton]} 
                onPress={simulateError}
              >
                <Text style={styles.errorButtonText}>Simulate Error</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={resetComponent}
            >
              <Text style={styles.secondaryButtonText}>Reset Component</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={clearResults}
            >
              <Text style={styles.clearButtonText}>Clear Test Results</Text>
            </TouchableOpacity>
          </View>

          {/* Test Results */}
          {testResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))}
            </View>
          )}

          {/* Testing Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.sectionTitle}>Testing Instructions</Text>
            <Text style={styles.instructionText}>1. Tap the upload component to select a file</Text>
            <Text style={styles.instructionText}>2. Try different file types (PDF, Word, other formats)</Text>
            <Text style={styles.instructionText}>3. Test file size limits (try large files)</Text>
            <Text style={styles.instructionText}>4. Use "Simulate Upload" to test progress states</Text>
            <Text style={styles.instructionText}>5. Use "Simulate Error" to test error handling</Text>
            <Text style={styles.instructionText}>6. Check console logs for detailed output</Text>
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
  
  // Section containers
  stateContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  componentContainer: {
    marginBottom: spacing.lg,
  },
  controlsContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  instructionsContainer: {
    backgroundColor: '#fff3cd',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  
  // Text styles
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
  fileDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
  },
  fileDetailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: 'monospace',
  },
  instructionText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  
  // Button styles
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  errorButton: {
    flex: 1,
    backgroundColor: colors.accent,
  },
  errorButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
});