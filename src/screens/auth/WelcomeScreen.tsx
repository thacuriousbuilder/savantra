import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

interface WelcomeScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLogin,
  onSignUp,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.brainIcon}>🧠</Text>
            </View>
          </View>
          <Text style={styles.brandName}>Savantra</Text>
          <Text style={styles.tagline}>Study Smart, On your Time!</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Savantra is an app that uses AI-powered quizzes that adapt to your 
            actual course schedule and deadlines.
          </Text>
        </View>

        {/* Placeholder for illustration */}
        <View style={styles.illustrationPlaceholder} />

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Light purple background
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary, // Purple logo background
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brainIcon: {
    fontSize: 40,
    color: colors.white,
  },
  brandName: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.primary, // Purple brand name
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.textPrimary, // Dark text
    textAlign: 'center',
    lineHeight: 32,
  },
  descriptionSection: {
    marginBottom: spacing.xxl,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textSecondary, // Gray description text
    lineHeight: 24,
    textAlign: 'left',
  },
  illustrationPlaceholder: {
    flex: 1,
    backgroundColor: colors.white, // White placeholder
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxl,
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.inputBorder, // Light border
  },
  buttonSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  loginButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    // borderRadius: borderRadius.md,
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: colors.primary, // Purple border
  },
  loginButtonText: {
    color: colors.primary, // Purple text
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  signUpButton: {
    flex: 1,
    backgroundColor: colors.secondary, // Green background
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: colors.white, // White text on green
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});