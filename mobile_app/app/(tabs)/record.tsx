import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNotes } from '../../context/NotesContext';

interface RecordTabProps {
  theme: 'dark' | 'light';
}

const RecordTab: React.FC<RecordTabProps> = ({ theme }) => {
  const { setNotes } = useNotes();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'stopped' | 'done' | 'processing'>('idle');
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    return () => {
      if (recording && !recording._isDoneRecording) {
        recording.stopAndUnloadAsync().catch(() => {
          // Handle any errors silently to avoid unhandled promise rejections
        });
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Microphone permission is required to record audio.');
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: 2, // Default format
          audioEncoder: 3, // Default encoder
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: 127, // High quality
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });
      await recording.startAsync();
      setRecording(recording);
      setRecordingStatus('recording');

      // Start the timer
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording && !recording._isDoneRecording) {
        await recording.stopAndUnloadAsync();
        setRecordingStatus('stopped');

        // Stop the timer
        if (timerInterval) {
          clearInterval(timerInterval);
          setTimerInterval(null);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const sendAudioToBackend = async () => {
    try {
      if (!recording) return;

      const uri = recording.getURI();
      if (!uri) {
        Alert.alert('Error', 'No audio file available.');
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.wav',
        type: 'audio/wav',
      } as any); // Explicitly cast to 'any' to bypass type errors

      const response = await fetch('https://13.232.165.109:8080/transcribe', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to process audio.');
        return;
      }

      const data = await response.json();
      const newNote = {
        id: Date.now().toString(),
        title: 'New Note',
        date: new Date().toLocaleDateString(),
        duration: 'Unknown',
        status: 'Completed',
        transcript: data.transcript, // Include transcript from backend
        summary: data.summary, // Include summary from backend
      };
      setNotes(newNote);
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Network request failed')) {
        Alert.alert('Error', 'Server is unreachable. Please check your connection.');
      } else {
        Alert.alert('Error', 'An error occurred while sending the audio.');
      }
    }
  };

  const handleTranscribe = async () => {
    try {
      setProgress(0);
      setRecordingStatus('processing');

      // Call the backend to transcribe and summarize the audio
      await sendAudioToBackend();

      // Simulate progress bar
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setRecordingStatus('done');
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    } catch (error) {
      Alert.alert('Error', 'Failed to transcribe audio.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
      {/* Top Section */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Welcome to Lecturer.AI</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#AAAAAA' : '#555555' }]}>Record your next lecture or meeting</Text>
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Pressable
          onPress={recordingStatus === 'idle' ? startRecording : stopRecording}
          style={[styles.recordButton, { backgroundColor: '#8A2BE2' }]}
        >
          {recordingStatus === 'recording' ? (
            <Ionicons name="stop" size={48} color="white" />
          ) : (
            <Ionicons name="mic" size={48} color="white" />
          )}
        </Pressable>

        {recordingStatus !== 'idle' && (
          <Text style={[styles.timer, { color: isDark ? '#FFFFFF' : '#000000' }]}>{formatTime(timer)}</Text>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={[styles.statusText, { color: isDark ? '#AAAAAA' : '#555555' }]}>{{
          idle: '',
          recording: 'Recording…',
          stopped: '',
          processing: 'Processing…',
          done: 'Done ✅',
        }[recordingStatus]}</Text>

        <Pressable
          onPress={() => {
            if (recordingStatus === 'done') {
              setRecordingStatus('idle');
              setTimer(0);
              setProgress(0);
            } else {
              handleTranscribe();
            }
          }}
          disabled={recordingStatus !== 'stopped' && recordingStatus !== 'done'}
          style={[styles.transcribeButton, (recordingStatus !== 'stopped' && recordingStatus !== 'done') && styles.disabledButton]}
        >
          <Text style={styles.transcribeButtonText}>
            {recordingStatus === 'done' ? 'Next session' : 'Transcribe & Summarize'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  middleSection: {
    alignItems: 'center',
  },
  recordButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8A2BE2',
  },
  transcribeButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8A2BE2',
  },
  disabledButton: {
    opacity: 0.5,
  },
  transcribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default RecordTab;
