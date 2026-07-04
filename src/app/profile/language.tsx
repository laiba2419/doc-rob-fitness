import BackHeader from '@/components/BackHeader';
import { languages } from '@/data/profile';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LanguageScreen() {
  const { theme } = useTheme();
  const [selected, setSelected] = useState('en');

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Choose Language</Text>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ gap: 10 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = selected === item.code;
          return (
            <TouchableOpacity
              style={[
                styles.row,
                { backgroundColor: theme.card, borderColor: active ? theme.primary : theme.border },
              ]}
              onPress={() => setSelected(item.code)}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.native, { color: theme.textSecondary }]}>{item.nativeName}</Text>
              </View>
              <Ionicons
                name={active ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={active ? theme.primary : theme.textSecondary}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 16 },
  name: { fontSize: 14, fontWeight: '700' },
  native: { fontSize: 12, marginTop: 2 },
});
