import BackHeader from '@/components/BackHeader';
import { dietCategories } from '@/data/diets';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Image, ImageSourcePropType, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type WorkoutCard = {
  id: string;
  image: ImageSourcePropType;
  isPro?: boolean;
};

const workoutCards: WorkoutCard[] = [
  { id: '1', image: require('../../../assets/images/workout-types/type-1.png')},
  { id: '2', image: require('../../../assets/images/workout-types/type-2.png') },
  { id: '3', image: require('../../../assets/images/workout-types/type-3.png') },
  { id: '4', image: require('../../../assets/images/workout-types/type-4.png')},
  { id: '5', image: require('../../../assets/images/workout-types/type-5.png') },
  { id: '6', image: require('../../../assets/images/workout-types/type-6.png')},
  { id: '7', image: require('../../../assets/images/workout-types/type-7.png') },
];

export default function PreferredWorkoutsScreen() {
  const { theme } = useTheme();
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>(['1']);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([dietCategories[0].id]);

  const toggleWorkout = (id: string) => {
    setSelectedWorkouts((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleDiet = (id: string) => {
    setSelectedDiets((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    Alert.alert('Preferences Saved', 'Your workout and nutrition preferences have been updated.');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.text }]}>Preferred Workouts & Nutrition</Text>

        {/* Workout Types */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Workout Types</Text>
        <View style={styles.workoutList}>
          {workoutCards.map((item) => {
            const active = selectedWorkouts.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.workoutCard,
                  { borderColor: active ? theme.primary : 'transparent', borderWidth: active ? 2 : 0 },
                ]}
                onPress={() => toggleWorkout(item.id)}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={styles.workoutImage} resizeMode="cover" />
      {active && (
                  <View style={styles.checkWrap}>
                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Diet Preferences */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Diet Preferences</Text>
        <View style={styles.dietGrid}>
          {dietCategories.map((cat) => {
            const active = selectedDiets.includes(cat.id);
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.dietCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: active ? theme.primary : theme.border,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
                onPress={() => toggleDiet(cat.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: cat.image }} style={styles.dietImage} resizeMode="cover" />
                <View style={styles.dietFooter}>
                  <Text style={[styles.dietLabel, { color: theme.text }]} numberOfLines={2}>
                    {cat.label}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={theme.primary} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  workoutList: { gap: 12, marginBottom: 24 },
  workoutCard: { borderRadius: 16, overflow: 'hidden', height: 160 },
  workoutImage: { width: '100%', height: '100%' },
  
  checkWrap: { position: 'absolute', top: 10, right: 10 },
  dietGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  dietCard: { width: '47%', borderRadius: 14, overflow: 'hidden' },
  dietImage: { width: '100%', height: 90 },
  dietFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, gap: 6 },
  dietLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  saveBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});