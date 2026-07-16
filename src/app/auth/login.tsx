import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '@/context/authcontext';
import { useUserProfile } from '@/context/UserProfileContext';
import { supabase } from '@/lib/supabase';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function LoginScreen() {
  const { theme, activeMode } = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { loadProfileForUser } = useUserProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const isLight = activeMode === 'light';

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('auth.common.missingFieldsTitle'), t('auth.login.missingFieldsMsg'));
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);

    if (error) {
      setLoading(false);
      Alert.alert(t('auth.login.loginFailedTitle'), error);
      return;
    }

    // ✅ Load THIS user's real profile from Supabase and overwrite whatever
    // was cached locally on this device -- without this, a previously
    // logged-in account's name/email/photo could keep showing after a
    // different account logs in on the same phone.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await loadProfileForUser(user.id);
    }

    setLoading(false);
    router.replace('/home');
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.tabRow}>
        <View style={styles.tabPill}>
          <Text style={[styles.tabText, { color: theme.text }]}>{t('auth.login.tab')}</Text>
          <View style={[styles.tabUnderline, { backgroundColor: theme.primary }]} />
        </View>
      </View>

      <View style={styles.topSection}>
        <View style={styles.headingCol}>
          <Text style={[styles.heading, { color: theme.text }]}>{t('auth.login.welcomeBack')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('auth.login.subtitle')}
          </Text>
        </View>

        <Image
          source={require('../../../assets/images/login-shape.png')}
          style={styles.bgBarsWrap}
          resizeMode="contain"
        />
      </View>

      <InputField
        label={t('auth.common.emailLabel')}
        placeholder={t('auth.common.emailPlaceholder')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        rightIcon="mail-outline"
      />
      <InputField
        label={t('auth.common.passwordLabel')}
        placeholder={t('auth.common.passwordPlaceholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)}>
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: rememberMe ? theme.primary : 'transparent',
                borderColor: rememberMe ? theme.primary : theme.border,
              },
            ]}
          >
            {rememberMe ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
          </View>
          <Text style={{ color: isLight ? '#2F2F2F' : theme.text, fontSize: 13 }}>{t('auth.login.rememberMe')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>{t('auth.login.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.orText, { color: isLight ? '#4A4A4A' : theme.textSecondary }]}>{t('auth.login.or')}</Text>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: isLight ? theme.text : theme.surface, borderColor: theme.border },
          ]}
          onPress={() => router.push('/auth/continue-phone')}
        >
          <Ionicons name="phone-portrait-outline" size={20} color={isLight ? '#FFFFFF' : theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: isLight ? theme.text : theme.surface, borderColor: theme.border },
          ]}
          onPress={() => Alert.alert(t('auth.login.comingSoonTitle'), t('auth.login.comingSoonMsg'))}
        >
          <Ionicons name="logo-google" size={20} color={isLight ? '#FFFFFF' : theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.socialBtn,
            { backgroundColor: isLight ? theme.text : theme.surface, borderColor: theme.border },
          ]}
        >
          <Ionicons name="logo-apple" size={20} color={isLight ? '#FFFFFF' : theme.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 8, marginBottom: 16 }} />
      ) : (
        <PrimaryButton title={t('auth.login.loginButton')} onPress={handleLogin} style={{ marginTop: 8, marginBottom: 16 }} />
      )}

      <View style={styles.signupRow}>
        <Text style={{ color: isLight ? '#4A4A4A' : theme.textSecondary }}>{t('auth.login.newUser')}</Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>{t('auth.login.registerNow')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 50, flexGrow: 1 },
  tabRow: { marginBottom: 18, flexDirection: 'row' },
  tabPill: {
    alignItems: 'flex-start',
  },
  tabText: { fontSize: 14, fontWeight: '600', marginBottom: 2},
  tabUnderline: { width: 36, height: 2, borderRadius: 1 },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    marginRight: -45,
  },
  headingCol: { flex: 1, paddingRight: 12 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14 },
  bgBarsWrap: {
    width: 180,
    height: 195,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13, fontWeight: '600' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 8 },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 20 },
});
