import BackHeader from '@/components/BackHeader';
import { gateways } from '@/lib/gateways';
import { useTheme } from '@/theme/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SelectGatewayScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [selected, setSelected] = useState(gateways[0].id);

  const handleContinue = () => {
    router.push({ pathname: '/profile/payment', params: { planId, gateway: selected } } as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <BackHeader />
      <Text style={[styles.title, { color: theme.text }]}>Payment Getaways</Text>

      <View style={styles.list}>
        {gateways.map((gw) => {
          const active = selected === gw.id;
          return (
            <TouchableOpacity
              key={gw.id}
              style={[
                styles.row,
                { backgroundColor: theme.card, borderColor: active ? theme.primary : theme.border },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelected(gw.id)}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: active ? theme.primary : theme.border },
                ]}
              >
                {active && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
              </View>

              <Image source={gw.image} style={styles.logoImage} resizeMode="contain" />

              <Text style={[styles.rowLabel, { color: theme.text }]}>{gw.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, { backgroundColor: theme.primary }]}
        onPress={handleContinue}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  list: { gap: 14, marginBottom: 24 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, paddingHorizontal: 16,
  },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  logoImage: { width: 32, height: 32 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  continueBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  continueBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});