import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { uploadArchetypesToFirestore } from '../utils/setupArchetypes';

const UploadQuestions = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    setIsUploading(true);
    setMessage('Uploading questions...');
    
    try {
      const success = await uploadArchetypesToFirestore();
      
      if (success) {
        setMessage('✅ All 20 questions uploaded successfully!');
      } else {
        setMessage('❌ Upload failed. Check console for errors.');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Setup</Text>
      <Text style={styles.subtitle}>Upload Questions to Firebase</Text>
      
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
      
      <TouchableOpacity
        style={[styles.button, isUploading && styles.buttonDisabled]}
        onPress={handleUpload}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload 20 Questions</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>
        Note: This will upload all questions to the 'personality_questions' collection.
        {'\n'}Only run this once!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UploadQuestions;