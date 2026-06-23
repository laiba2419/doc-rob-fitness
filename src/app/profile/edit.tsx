import BackHeader from '@/components/BackHeader';
import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const cmToFeet = (cm: number) => Math.round((cm / 30.48) * 10) / 10;
const feetToCm = (ft: number) => Math.round(ft * 30.48);
const kgToLb = (kg: number) => Math.round(kg * 2.20462);
const lbToKg = (lb: number) => Math.round(lb / 2.20462);

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(profile.weightUnit);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(profile.heightUnit);

  const initialWeightDisplay = profile.weight
    ? weightUnit === 'kg'
      ? String(profile.weight)
      : String(kgToLb(profile.weight))
    : '';
  const initialHeightDisplay = profile.height
    ? heightUnit === 'cm'
      ? String(profile.height)
      : String(cmToFeet(profile.height))
    : '';

  const [weightValue, setWeightValue] = useState(initialWeightDisplay);
  const [heightValue, setHeightValue] = useState(initialHeightDisplay);

  const toggleWeightUnit = (unit: 'kg' | 'lb') => {
    if (unit === weightUnit) return;
    const num = parseFloat(weightValue);
    if (!isNaN(num)) {
      setWeightValue(unit === 'lb' ? String(kgToLb(num)) : String(lbToKg(num)));
    }
    setWeightUnit(unit);
  };

  const toggleHeightUnit = (unit: 'cm' | 'ft') => {
    if (unit === heightUnit) return;
    const num = parseFloat(heightValue);
    if (!isNaN(num)) {
      setHeightValue(unit === 'ft' ? String(cmToFeet(num)) : String(feetToCm(num)));
    }
    setHeightUnit(unit);
  };

  const handleSave = async () => {
    const weightNum = parseFloat(weightValue);
    const heightNum = parseFloat(heightValue);
    const ageNum = parseInt(age, 10);

    await updateProfile({
      age: !isNaN(ageNum) ? ageNum : profile.age,
      weight: !isNaN(weightNum) ? (weightUnit === 'kg' ? weightNum : lbToKg(weightNum)) : profile.weight,
      weightUnit,
      height: !isNaN(heightNum) ? (heightUnit === 'cm' ? heightNum : feetToCm(heightNum)) : profile.height,
      heightUnit,
    });

    Alert.alert('Profile Updated', 'Your changes have been saved.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <BackHeader />
        <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>

        <View style={styles.avatarSection}>
          <View style={[styles.avatarWrap, { backgroundColor: theme.surface }]}>
            <Ionicons name="person-circle" size={84} color={theme.primary} />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.primary, borderColor: theme.background }]}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Field label="First Name" theme={theme} value={firstName} onChangeText={setFirstName} placeholder="Enter first name" />
        <Field label="Last Name" theme={theme} value={lastName} onChangeText={setLastName} placeholder="Enter last name" />
        <Field label="Email" theme={theme} value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address" />

        <Text style={[styles.label, { color: theme.text }]}>Mobile Number</Text>
        <View style={[styles.mobileRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Text style={[styles.codeText, { color: theme.textSecondary }]}>+92</Text>
          <View style={[styles.codeDivider, { backgroundColor: theme.border }]} />
          <TextInput
            style={[styles.mobileInput, { color: theme.text }]}
            value={mobile}
            onChangeText={setMobile}
            placeholder="300 1234567"
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        <Field label="Age" theme={theme} value={age} onChangeText={setAge} placeholder="Enter age" keyboardType="number-pad" />

        <Text style={[styles.label, { color: theme.text }]}>Gender</Text>
        <View style={styles.toggleRow}>
          {(['male', 'female'] as const).map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.toggleBtn,
                { borderColor: theme.border, backgroundColor: gender === g ? theme.primary : theme.inputBg },
              ]}
              onPress={() => setGender(g)}
            >
              <Ionicons
                name={g === 'male' ? 'male' : 'female'}
                size={16}
                color={gender === g ? '#FFFFFF' : theme.textSecondary}
              />
              <Text style={{ color: gender === g ? '#FFFFFF' : theme.text, fontWeight: '600', marginLeft: 6 }}>
                {g === 'male' ? 'Male' : 'Female'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Weight</Text>
        <View style={styles.unitFieldRow}>
          <TextInput
            style={[styles.unitInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            value={weightValue}
            onChangeText={setWeightValue}
            placeholder="0"
            placeholderTextColor={theme.placeholder}
            keyboardType="decimal-pad"
          />
          <View style={styles.unitToggleRow}>
            {(['kg', 'lb'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitToggleBtn,
                  { borderColor: theme.border, backgroundColor: weightUnit === u ? theme.primary : theme.inputBg },
                ]}
                onPress={() => toggleWeightUnit(u)}
              >
                <Text style={{ color: weightUnit === u ? '#FFFFFF' : theme.text, fontWeight: '700', fontSize: 12 }}>
                  {u.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Height</Text>
        <View style={styles.unitFieldRow}>
          <TextInput
            style={[styles.unitInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            value={heightValue}
            onChangeText={setHeightValue}
            placeholder="0"
            placeholderTextColor={theme.placeholder}
            keyboardType="decimal-pad"
          />
          <View style={styles.unitToggleRow}>
            {(['cm', 'ft'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  styles.unitToggleBtn,
                  { borderColor: theme.border, backgroundColor: heightUnit === u ? theme.primary : theme.inputBg },
                ]}
                onPress={() => toggleHeightUnit(u)}
              >
                <Text style={{ color: heightUnit === u ? '#FFFFFF' : theme.text, fontWeight: '700', fontSize: 12 }}>
                  {u === 'cm' ? 'CM' : 'FEET'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, theme, ...props }: any) {
  return (
    <>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
        placeholderTextColor={theme.placeholder}
        {...props}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2,
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14, marginBottom: 16 },
  mobileRow: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, marginBottom: 16 },
  codeText: { fontSize: 14, fontWeight: '600' },
  codeDivider: { width: 1, height: 20, marginHorizontal: 10 },
  mobileInput: { flex: 1, fontSize: 14 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: { flex: 1, flexDirection: 'row', height: 48, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  unitFieldRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  unitInput: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  unitToggleRow: { flexDirection: 'row', borderRadius: 12, overflow: 'hidden', gap: 6 },
  unitToggleBtn: { width: 52, height: 48, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtn: { height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
