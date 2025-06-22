import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export const AuthTester: React.FC = () => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    login, 
    signup, 
    logout, 
    initializeAuth 
  } = useAuthStore();

  // Store test credentials
  const [testCredentials, setTestCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const testSignup = async () => {
    // Generate unique credentials
    const timestamp = Date.now();
    const email = `testuser${timestamp}@savantra.com`;
    const password = 'password123';
    
    const success = await signup(email, password, 'John', 'Doe');
    
    if (success) {
      setTestCredentials({ email, password });
      Alert.alert('Signup Success!', `Created user: ${email}`);
    } else {
      Alert.alert('Signup Failed', 'Check console for details');
    }
  };

  const testLogin = async () => {
    if (!testCredentials) {
      Alert.alert('No Test User', 'Please signup first to create test credentials');
      return;
    }

    const success = await login(testCredentials.email, testCredentials.password);
    Alert.alert('Login Result', success ? 'Success!' : 'Failed - Check console');
  };

  const testLogout = async () => {
    await logout();
    Alert.alert('Logout', 'Logged out successfully');
  };

  const testInitialize = async () => {
    await initializeAuth();
    Alert.alert('Initialize', 'Auth state initialized');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Auth Store Tester</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Loading: {isLoading ? '⏳ Yes' : '✅ No'}</Text>
        <Text style={styles.statusText}>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.statusText}>User: {user ? `👤 ${user.email}` : '👤 None'}</Text>
        <Text style={styles.statusText}>Test User: {testCredentials ? `📧 ${testCredentials.email}` : '📧 None'}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={testInitialize}>
        <Text style={styles.buttonText}>1️⃣ Initialize Auth</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testSignup}>
        <Text style={styles.buttonText}>2️⃣ Test Signup</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testLogin} disabled={!testCredentials}>
        <Text style={[styles.buttonText, !testCredentials && styles.disabledText]}>
          3️⃣ Test Login
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testLogout}>
        <Text style={styles.buttonText}>4️⃣ Test Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  statusContainer: { 
    backgroundColor: '#f5f5f5', 
    padding: 15, 
    borderRadius: 8, 
    gap: 5 
  },
  statusText: { fontSize: 14 },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.5,
  },
});