import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';
import { UserProfileProvider } from '../context/UserProfileContext';

function RootStack() {
  const { activeMode } = useTheme();

  return (
    <>
      <StatusBar style={activeMode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
       <Stack.Screen name="onboarding/screen" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="auth/continue-phone" />
        <Stack.Screen name="auth/verify-otp" />
        <Stack.Screen name="setup/details" />
        <Stack.Screen name="setup/gender" />
        <Stack.Screen name="setup/age" />
        <Stack.Screen name="setup/height-weight" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <RootStack />
      </UserProfileProvider>
    </ThemeProvider>
  );
}
