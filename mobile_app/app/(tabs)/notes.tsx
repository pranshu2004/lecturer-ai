import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotes } from '../../context/NotesContext';

interface NotesProps {
  theme: 'dark' | 'light';
}

const Notes: React.FC<NotesProps> = ({ theme }) => {
  const router = useRouter();
  const { notes } = useNotes();
  const isDark = theme === 'dark';

  const renderItem = ({ item }: { item: { id: string; title: string; date: string; duration: string; status: string; transcript?: string; summary?: string } }) => (
    <Pressable
      onPress={() => {
        Alert.alert(
          item.title,
          `Transcript:\n${item.transcript || 'No transcript available.'}\n\nSummary:\n${item.summary || 'No summary available.'}`
        );
      }}
      style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#F9F9F9' }]}
    >
      <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.title}</Text>
      <Text style={[styles.cardSubtitle, { color: isDark ? '#AAAAAA' : '#555555' }]}>{item.date} • {item.duration}</Text>
      <View style={[styles.badge, { backgroundColor: isDark ? '#8A2BE2' : '#E0E0E0' }]}>
        <Text style={[styles.badgeText, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.status}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
      {/* Header */}
      <Text style={[styles.header, { color: isDark ? '#FFFFFF' : '#000000' }]}>Previous Sessions</Text>

      {/* Session List */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />

      {/* Floating Button */}
      <Pressable
        style={styles.floatingButton}
        onPress={() => router.push('/record')} // Correct navigation method for Expo Router
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48, // Added padding to shift everything down
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 80, // Space for floating button
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default Notes;
