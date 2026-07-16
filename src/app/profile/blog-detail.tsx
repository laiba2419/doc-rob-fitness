import BackHeader from '@/components/BackHeader';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BlogDetailScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, loading } = useBlogPosts(i18n.language);

  if (loading && posts.length === 0) {
    return (
      <View style={[styles.screen, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const post = posts.find((p) => p.id === id) ?? posts[0];

  if (!post) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <View style={styles.headerPad}>
          <BackHeader />
        </View>
        <Text style={[styles.body, { color: theme.textSecondary, padding: 20 }]}>
          {t('profile.blogDetail.notFound')}
        </Text>
      </View>
    );
  }

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
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerPad: { paddingHorizontal: 20, paddingTop: 12 },
  image: { width: '100%', height: 220 },
  content: { padding: 20 },
  date: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 14, lineHeight: 28 },
  body: { fontSize: 14, lineHeight: 22 },
});