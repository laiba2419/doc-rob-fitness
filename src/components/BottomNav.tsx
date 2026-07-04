import { useTheme } from '@/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type NavTab = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const tabs: NavTab[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/' },
  { id: 'diet', label: 'Diet Plan', icon: 'restaurant-outline', activeIcon: 'restaurant', route: '/diet' },
  { id: 'store', label: 'Store', icon: 'bag-outline', activeIcon: 'bag', route: '/store' },
  { id: 'report', label: 'Report', icon: 'bar-chart-outline', activeIcon: 'bar-chart', route: '/report' },
  { id: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/profile' },
];

export default function BottomNav() {
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  };

  const handlePress = (route: string) => {
    if (isActive(route)) return;
    router.push(route as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => handlePress(tab.route)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={22}
              color={active ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: active ? theme.primary : theme.textSecondary },
                active && styles.labelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '700',
  },
});
