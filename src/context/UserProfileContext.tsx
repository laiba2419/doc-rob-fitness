import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@user_profile';

export type UserProfile = {
  // existing fields
  age: number | null;
  height: number | null;
  heightUnit: 'cm' | 'ft';
  weight: number | null;
  weightUnit: 'kg' | 'lb';
  // new fields for Edit Profile
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  gender?: 'Male' | 'Female' | 'Other';
  avatarUri?: string;
};

const defaultProfile: UserProfile = {
  age: null,
  height: null,
  heightUnit: 'cm',
  weight: null,
  weightUnit: 'kg',
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: 'Male',
  avatarUri: undefined,
};

type UserProfileContextType = {
  profile: UserProfile;
  isLoaded: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setProfile: (profile: UserProfile) => void; // for EditProfileScreen direct save
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(defaultProfile);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setProfileState({ ...defaultProfile, ...JSON.parse(stored) });
        }
      } catch (error) {
        console.warn('Failed to load user profile from storage', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const next = { ...profile, ...updates };
    setProfileState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to save user profile to storage', error);
    }
  };

  const setProfile = async (next: UserProfile) => {
    setProfileState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to save user profile to storage', error);
    }
  };

  return (
    <UserProfileContext.Provider value={{ profile, isLoaded, updateProfile, setProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return ctx;
}
