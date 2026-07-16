import BackHeader from '@/components/BackHeader';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BlogScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { posts, loading, error, refetch } = useBlogPosts(i18n.language);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>{t('profile.blog.title')}</Text>

      {loading && posts.length === 0 ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : posts.length === 0 ? (
        <Text style={[styles.excerpt, { color: theme.textSecondary, marginTop: 20 }]}>
          {error ? t('profile.blog.errorPrefix', { message: error }) : t('profile.blog.emptyState')}
        </Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={theme.primary} />
          }
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  loader: { marginTop: 40 },
  listContent: { paddingBottom: 24, gap: 14 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  image: { width: '100%', height: 150 },
  cardBody: { padding: 14 },
  date: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  excerpt: { fontSize: 13, lineHeight: 18 },
});