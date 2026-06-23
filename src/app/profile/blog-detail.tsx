import BackHeader from '@/components/BackHeader';
import { blogPosts } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BlogDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id) ?? blogPosts[0];

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerPad}>
          <BackHeader />
        </View>
        <Image source={{ uri: post.image }} style={styles.image} />
        <View style={styles.content}>
          <Text style={[styles.date, { color: theme.primary }]}>{post.date}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{post.title}</Text>
          <Text style={[styles.body, { color: theme.textSecondary }]}>{post.content}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerPad: { paddingHorizontal: 20, paddingTop: 12 },
  image: { width: '100%', height: 220 },
  content: { padding: 20 },
  date: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 14, lineHeight: 28 },
  body: { fontSize: 14, lineHeight: 22 },
});
