import { useUserProfile } from '@/context/UserProfileContext';
import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type WeightUnit = 'kg' | 'lb';
type HeightUnit = 'cm' | 'ft';
type Gender = 'Male' | 'Female' | 'Other';

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { profile, setProfile } = useUserProfile();

  const [avatarUri, setAvatarUri] = useState<string | undefined>(profile.avatarUri);
  const [headerHeight, setHeaderHeight] = useState(124);
  const [firstName, setFirstName] = useState(profile.firstName ?? '');
  const [lastName, setLastName] = useState(profile.lastName ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [mobile, setMobile] = useState(profile.mobile ?? '');
  const [age, setAge] = useState(profile.age ? String(profile.age) : '');
  const [gender, setGender] = useState<Gender>((profile.gender as Gender) ?? 'Male');
  const [weight, setWeight] = useState(profile.weight ? String(profile.weight) : '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>((profile.weightUnit as WeightUnit) ?? 'kg');
  const [height, setHeight] = useState(profile.height ? String(profile.height) : '');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>((profile.heightUnit as HeightUnit) ?? 'cm');

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Gallery'], cancelButtonIndex: 0 },
        (i) => { if (i === 1) pickFromCamera(); if (i === 2) pickFromGallery(); }
      );
    } else {
      Alert.alert('Update Photo', '', [
        { text: 'Take Photo', onPress: pickFromCamera },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleSave = () => {
    setProfile({
      ...profile,
      avatarUri,
      firstName,
      lastName,
      email,
      mobile,
      age: age ? Number(age) : null,
      gender,
      weight: weight ? Number(weight) : null,
      weightUnit,
      height: height ? Number(height) : null,
      heightUnit,
    });
    router.back();
  };

  const labelStyle = [styles.label, { color: theme.textSecondary }];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[styles.header, { backgroundColor: theme.primary }]}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={[styles.avatarSection, { top: headerHeight - 40 }]} pointerEvents="box-none">
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarTouchable}>
          <View style={[styles.avatarWrap, { backgroundColor: theme.surface, borderColor: theme.background }]}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={theme.primary} />
            )}
          </View>
          <View style={[styles.editBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}>
            <Ionicons name="camera" size={11} color="#FFF" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.fields, { marginTop: 44 }]}>
          <Text style={labelStyle}>First Name</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={firstName} onChangeText={setFirstName} placeholder="First Name" placeholderTextColor={theme.textSecondary} />
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
          </View>

          <Text style={labelStyle}>Last Name</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={lastName} onChangeText={setLastName} placeholder="Last Name" placeholderTextColor={theme.textSecondary} />
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
          </View>

          <Text style={labelStyle}>Email</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={theme.textSecondary} />
            <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
          </View>

          <Text style={labelStyle}>Mobile Number</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={mobile} onChangeText={setMobile} placeholder="+91 | Mobile number" keyboardType="phone-pad" placeholderTextColor={theme.textSecondary} />
            <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
          </View>

          <Text style={labelStyle}>Age</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={age} onChangeText={setAge} placeholder="Age" keyboardType="number-pad" placeholderTextColor={theme.textSecondary} />
            <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
          </View>

          <Text style={labelStyle}>Gender</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.inputInner, { color: theme.text }]}>{gender}</Text>
            <TouchableOpacity
              onPress={() => {
                const options = ['Male', 'Female', 'Other', 'Cancel'];
                if (Platform.OS === 'ios') {
                  ActionSheetIOS.showActionSheetWithOptions(
                    { options, cancelButtonIndex: 3 },
                    (i) => { if (i < 3) setGender(options[i] as Gender); }
                  );
                } else {
                  Alert.alert('Select Gender', '', [
                    { text: 'Male', onPress: () => setGender('Male') },
                    { text: 'Female', onPress: () => setGender('Female') },
                    { text: 'Other', onPress: () => setGender('Other') },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }
              }}
            >
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={labelStyle}>Weight</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={weight} onChangeText={setWeight} placeholder="Weight" keyboardType="decimal-pad" placeholderTextColor={theme.textSecondary} />
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, weightUnit === 'lb' && { backgroundColor: theme.primary }]}
                onPress={() => setWeightUnit('lb')}
              >
                <Text style={[styles.unitText, { color: weightUnit === 'lb' ? '#FFF' : theme.textSecondary }]}>LB</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, weightUnit === 'kg' && { backgroundColor: theme.primary }]}
                onPress={() => setWeightUnit('kg')}
              >
                <Text style={[styles.unitText, { color: weightUnit === 'kg' ? '#FFF' : theme.textSecondary }]}>KG</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={labelStyle}>Height</Text>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput style={[styles.inputInner, { color: theme.text }]} value={height} onChangeText={setHeight} placeholder="Height" keyboardType="decimal-pad" placeholderTextColor={theme.textSecondary} />
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, heightUnit === 'ft' && { backgroundColor: theme.primary }]}
                onPress={() => setHeightUnit('ft')}
              >
                <Text style={[styles.unitText, { color: heightUnit === 'ft' ? '#FFF' : theme.textSecondary }]}>FT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, heightUnit === 'cm' && { backgroundColor: theme.primary }]}
                onPress={() => setHeightUnit('cm')}
              >
                <Text style={[styles.unitText, { color: heightUnit === 'cm' ? '#FFF' : theme.textSecondary }]}>CM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingBottom: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarTouchable: { position: 'relative' },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fields: { gap: 4 },
  label: { fontSize: 12, fontWeight: '500', marginBottom: 6, marginTop: 14 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  inputInner: { flex: 1, fontSize: 14, fontWeight: '400', padding: 0 },
  unitToggle: { flexDirection: 'row', gap: 4 },
  unitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  unitText: { fontSize: 11, fontWeight: '600' },
  saveBtn: {
    marginTop: 32,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});