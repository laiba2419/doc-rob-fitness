import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';

export default function LoginScreen() {
  const { theme, activeMode } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const isLight = activeMode === 'light';

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={styles.container}>
      <View style={styles.tabRow}>
        <View style={styles.tabPill}>
          <Text style={[styles.tabText, { color: theme.text }]}>Login</Text>
          <View style={[styles.tabUnderline, { backgroundColor: theme.primary }]} />
        </View>
      </View>

      <View style={styles.topSection}>
        <View style={styles.headingCol}>
          <Text style={[styles.heading, { color: theme.text }]}>Welcome Back,</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Hello there, sign in to continue!
          </Text>
        </View>

        <Image
          source={require('../../../assets/images/login-shape.png')}
          style={styles.bgBarsWrap}
          resizeMode="contain"
        />
      </View>

      <InputField
        label="Email"
        placeholder="your_email@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        rightIcon="mail-outline"
      />
      <InputField
        label="Password"
        placeholder="Enter password"
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
          <Text style={{ color: isLight ? '#2F2F2F' : theme.text, fontSize: 13 }}>Remember Me</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: theme.border }]} />
        <Text style={[styles.orText, { color: isLight ? '#4A4A4A' : theme.textSecondary }]}>OR</Text>
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

      <PrimaryButton title="Login" onPress={() => router.replace('/home')} style={{ marginTop: 8, marginBottom: 16 }} />

      <View style={styles.signupRow}>
        <Text style={{ color: isLight ? '#4A4A4A' : theme.textSecondary }}>New User? </Text>
        <TouchableOpacity onPress={() => router.push('/setup/details')}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Register Now</Text>
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
