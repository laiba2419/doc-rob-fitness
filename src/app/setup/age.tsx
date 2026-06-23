import BackHeader from '@/components/BackHeader';
import PrimaryButton from '@/components/PrimaryButton';
import StepProgressBar from '@/components/StepProgressBar';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from 'react-native';

const ITEM_HEIGHT = 50;
const AGES = Array.from({ length: 80 }, (_, i) => i + 10);

export default function InputAge() {
  const { theme } = useTheme();
  const router = useRouter();
  const { updateProfile } = useUserProfile();
  const [selectedAge, setSelectedAge] = useState(36);
  const listRef = useRef<FlatList>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const age = AGES[Math.min(Math.max(index, 0), AGES.length - 1)];
    setSelectedAge(age);
  };

  const handleNext = async () => {
    await updateProfile({ age: selectedAge });
    router.push('/setup/height-weight');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader />
      <StepProgressBar totalSteps={4} currentStep={3} />

      <Text style={[styles.title, { color: theme.text }]}>How old are you?</Text>

      <View style={styles.pickerWrap}>
        <View style={[styles.highlightLine, { borderColor: theme.primary, top: ITEM_HEIGHT * 2 }]} />
        <View style={[styles.highlightLine, { borderColor: theme.primary, top: ITEM_HEIGHT * 3 }]} />
        <FlatList
          ref={listRef}
          data={AGES}
          keyExtractor={(item) => item.toString()}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          initialScrollIndex={AGES.indexOf(36)}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={[item === selectedAge ? styles.activeText : styles.inactiveText, { color: item === selectedAge ? theme.text : theme.textSecondary }]}>
                {item}
              </Text>
            </View>
          )}
        />
      </View>

      <PrimaryButton title="Next" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  pickerWrap: { height: ITEM_HEIGHT * 5, justifyContent: 'center', marginBottom: 24 },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  activeText: { fontSize: 28, fontWeight: '700' },
  inactiveText: { fontSize: 18, fontWeight: '400' },
  highlightLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1 },
});
