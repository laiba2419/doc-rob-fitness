import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import { useTheme } from '../../theme/ThemeContext';

const { width: SW } = Dimensions.get('window');

// ── Figma exact: Image component 275.63 × 456.7 inside 375px phone ──
const IMG_W = SW * 0.735;
const IMG_H = SW * 1.218;
const GIRL_W = SW * 1.05;  // girl badi
const GIRL_H = SW * 1.75;  // girl badi

// ── Stripe sizing ──────────────────────────────────────────────────
const S_W = IMG_W * 1.16;   // 0.60 → 0.75
const S_H = IMG_W * 0.30;   // 0.095 → 0.11 // stripe widt // stripe height — thin so no overlap
const GAP = S_H * 0;     // clear gap between stripes

// ── Horizontal: top+bottom centered, middle shifts left ───────────
const L_TB    = (IMG_W - S_W) / 6;
const L_LIGHT_TOP = L_TB - IMG_W * 0.18;  // aur left// 1st stripe left
const L_LIGHT_BOT = L_TB + IMG_W * 0.28 - IMG_W * 0.20;  // 3rd stripe same rakho  // right side
const L_DARK  = L_TB - IMG_W * 0.12 - IMG_W * 0.20 + IMG_W * 0.15;  // right
const CY    = IMG_H * 0.65;
const MID_T = CY - S_H / 3;
const BOT_T = MID_T + S_H * 0.2;       // neeche
const TOP_T = BOT_T - S_H * 2.1;       // upar — same left as 3rd

const SLIDES = [
  {
    image: require('../../../assets/images/onboarding1.png'),
    title: 'Find The Right Workout for What You Need',
  },
  {
    image: require('../../../assets/images/onboarding2.png'),
    title: 'Choose Proper Workout & Diet Plan to Stay Fit.',
  },
  {
    image: require('../../../assets/images/onboarding3.png'),
    title: 'Easily Track Your Daily Activity',
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const router   = useRouter();
  const scrollX  = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = (i: number) =>
    scrollRef.current?.scrollTo?.({ x: i * SW, animated: true });

  const handleNext = () =>
    activeIndex < SLIDES.length - 1
      ? goToSlide(activeIndex + 1)
      : router.push('/auth/login');

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / SW));

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={s.skip}
        onPress={() => router.push('/auth/login')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[s.skipText, { color: theme.primary }]}>Skip</Text>
      </TouchableOpacity>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={[s.slide, { width: SW }]}>

            {/* ── Image container ── */}
            <View style={s.imgWrap}>

<View style={[s.stripe, { top: TOP_T, left: L_LIGHT_TOP, backgroundColor: '#A4D7F4' }]} />
<View style={[s.stripe, { top: MID_T - IMG_H * 0.09, left: L_DARK, backgroundColor: '#0094E8' }]} />
<View style={[s.stripe, { top: BOT_T, left: L_LIGHT_BOT, backgroundColor: '#A4D7F4' }]} />
              {/* Foot shadow */}
              <View style={s.shadow} />

              {/* Girl — on top of stripes */}
              <Image source={slide.image} style={s.img} resizeMode="contain" />
            </View>

          </View>
        ))}
      </Animated.ScrollView>

      {/* ── Bottom card ── */}
      <View style={[s.card, { backgroundColor: theme.card }]}>
        <View style={s.titleWrap}>
          {SLIDES.map((slide, index) => {
            const range = [(index-1)*SW, index*SW, (index+1)*SW];
            const opacity   = scrollX.interpolate({ inputRange: range, outputRange: [0,1,0], extrapolate: 'clamp' });
            const translateY = scrollX.interpolate({ inputRange: range, outputRange: [10,0,10], extrapolate: 'clamp' });
            return (
              <Animated.Text
                key={index}
                style={[s.title, { color: theme.text, opacity, transform: [{ translateY }], position: 'absolute', width: '100%' }]}
              >
                {slide.title}
              </Animated.Text>
            );
          })}
        </View>

        <View style={s.dotsRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, {
              backgroundColor: i === activeIndex ? theme.primary : theme.border,
              width: i === activeIndex ? 20 : 6,
            }]} />
          ))}
        </View>

        <PrimaryButton
          title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  skip: { position: 'absolute', top: 52, right: 20, zIndex: 10 },

  skipText: { fontSize: 14, fontWeight: '600' },

  slide: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  imgWrap: {
    width: IMG_W,
    height: IMG_H,
    overflow: 'visible',
  },

  stripe: {
    position: 'absolute',
    width: S_W,
    height: S_H,
    borderRadius: 0,
    transform: [{ rotate: '-41deg' }],
    zIndex: 1,
  },

  shadow: {
    position: 'absolute',
    bottom: 2,
    alignSelf: 'center',
    width: IMG_W * 0.18,
    height: IMG_W * 0.025,
    borderRadius: 99,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 2,
  },

  img: {
    position: 'absolute',
    top: -80,
    left: -(GIRL_W - IMG_W) / 3,
    width: GIRL_W,
    height: GIRL_H,
    zIndex: 3,
  },

  card: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  titleWrap: { height: 80, marginBottom: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
});
