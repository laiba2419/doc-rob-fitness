import BackHeader from '@/components/BackHeader';
import { dietCategories } from '@/data/diets';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DietCategoriesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const openCategory = (categoryId: string) => {
    console.log('Tapped category:', categoryId);
    router.push({ pathname: '/diet/category', params: { id: categoryId } });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Diet Categories</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {dietCategories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.item}
            onPress={() => openCategory(cat.id)}
          >
            <Image source={{ uri: cat.image }} style={[styles.image, { borderColor: theme.border }]} />
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={2}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  item: { width: '47%', alignItems: 'center', marginBottom: 24 },
  image: { width: '100%', height: 110, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
