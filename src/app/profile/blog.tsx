import BackHeader from '@/components/BackHeader';
import { blogPosts } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BlogScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Blog</Text>

      <FlatList
        data={blogPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/profile/blog-detail', params: { id: item.id } } as any)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text style={[styles.date, { color: theme.primary }]}>{item.date}</Text>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.excerpt, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.excerpt}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  listContent: { paddingBottom: 24, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  image: { width: '100%', height: 150 },
  cardBody: { padding: 14 },
  date: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  excerpt: { fontSize: 13, lineHeight: 18 },
});
