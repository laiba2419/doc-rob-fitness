import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@user_profile';

export type UserProfile = {
  age: number | null;
  height: number | null;
  heightUnit: 'cm' | 'ft';
  weight: number | null;
  weightUnit: 'kg' | 'lb';
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
  setProfile: (profile: UserProfile) => void;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

// Supabase profiles table ko update/insert karne wala helper
async function syncProfileToSupabase(profile: UserProfile) {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.warn('Supabase sync skipped: user not logged in');
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      full_name: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim(),
      gender: profile.gender ?? null,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      mobile: profile.mobile ?? null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Failed to sync profile to Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Supabase sync error:', err);
  }
}

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
    // Local save ke sath sath Supabase me bhi save karo
    await syncProfileToSupabase(next);
  };

  const setProfile = async (next: UserProfile) => {
    setProfileState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Failed to save user profile to storage', error);
    }
    await syncProfileToSupabase(next);
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