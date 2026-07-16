import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const IMG_W = SW * 0.735;
const IMG_H = SW * 1.218;

// ═══════════════════════════════════════════════════════════════
//  SCREEN 1 — STRIPES
// ═══════════════════════════════════════════════════════════════
const SCREEN1_TOP_STRIPE = { top: IMG_H * 0.17, left: IMG_W * -0.10, width: IMG_W * 0.99, height: IMG_W * 0.29, color: '#A4D7F4' };
const SCREEN1_MID_STRIPE = { top: IMG_H * 0.44, left: IMG_W * -0.15, width: IMG_W * 0.95, height: IMG_W * 0.29, color: '#0094E8' };
const SCREEN1_END_STRIPE = { top: IMG_H * 0.52, left: IMG_W * 0.16, width: IMG_W * 1, height: IMG_W * 0.29, color: '#A4D7F4' };

const SCREEN1_GIRL_W = SW * 1.05;
const SCREEN1_GIRL_H = SW * 1.58;
const SCREEN1_GIRL_TOP = -SW * 0.1;
const SCREEN1_GIRL_LEFT = -(SW * 1.18 - IMG_W) / 2.2;

// ═══════════════════════════════════════════════════════════════
//  SCREEN 2 — STRIPES
// ═══════════════════════════════════════════════════════════════
const SCREEN2_TOP_STRIPE = { top: IMG_H * 0.17, left: IMG_W * -0.10, width: IMG_W * 0.99, height: IMG_W * 0.29, color: '#A4D7F4' };
const SCREEN2_MID_STRIPE = { top: IMG_H * 0.44, left: IMG_W * -0.15, width: IMG_W * 0.95, height: IMG_W * 0.29, color: '#0094E8' };
const SCREEN2_END_STRIPE = { top: IMG_H * 0.52, left: IMG_W * 0.16, width: IMG_W * 1, height: IMG_W * 0.29, color: '#A4D7F4' };

const SCREEN2_GIRL_W = SW * 1.05;
const SCREEN2_GIRL_H = SW * 1.58;
const SCREEN2_GIRL_TOP = -SW * 0.2;
const SCREEN2_GIRL_LEFT = -(SW * 1.18 - IMG_W) / 2.2;

// ═══════════════════════════════════════════════════════════════
//  SCREEN 3 — STRIPES
// ═══════════════════════════════════════════════════════════════
const SCREEN3_TOP_STRIPE = { top: IMG_H * 0.17, left: IMG_W * -0.10, width: IMG_W * 0.99, height: IMG_W * 0.29, color: '#A4D7F4' };
const SCREEN3_MID_STRIPE = { top: IMG_H * 0.44, left: IMG_W * -0.15, width: IMG_W * 0.95, height: IMG_W * 0.29, color: '#0094E8' };
const SCREEN3_END_STRIPE = { top: IMG_H * 0.52, left: IMG_W * 0.16, width: IMG_W * 1, height: IMG_W * 0.29, color: '#A4D7F4' };

const SCREEN3_GIRL_W = SW * 1.0;
const SCREEN3_GIRL_H = SW * 1.68;
const SCREEN3_GIRL_TOP = -SW * 0.3;
const SCREEN3_GIRL_LEFT = -(SW * 1.18 - IMG_W) / 2.2;

// ═══════════════════════════════════════════════════════════════
//  SLIDES ARRAY — titleKey ab i18n key hai, translation runtime pe
//  useTranslation() ke zariye component ke andar resolve hoti hai
// ═══════════════════════════════════════════════════════════════
const SLIDES = [
  {
    image: require('../../../assets/images/onboarding1.png'),
    titleKey: 'onboarding.slide1Title',
    stripes: { top: SCREEN1_TOP_STRIPE, mid: SCREEN1_MID_STRIPE, end: SCREEN1_END_STRIPE },
    girl: { w: SCREEN1_GIRL_W, h: SCREEN1_GIRL_H, top: SCREEN1_GIRL_TOP, left: SCREEN1_GIRL_LEFT },
  },
  {
    image: require('../../../assets/images/onboarding2.png'),
    titleKey: 'onboarding.slide2Title',
    stripes: { top: SCREEN2_TOP_STRIPE, mid: SCREEN2_MID_STRIPE, end: SCREEN2_END_STRIPE },
    girl: { w: SCREEN2_GIRL_W, h: SCREEN2_GIRL_H, top: SCREEN2_GIRL_TOP, left: SCREEN2_GIRL_LEFT },
  },
  {
    image: require('../../../assets/images/onboarding3.png'),
    titleKey: 'onboarding.slide3Title',
    stripes: { top: SCREEN3_TOP_STRIPE, mid: SCREEN3_MID_STRIPE, end: SCREEN3_END_STRIPE },
    girl: { w: SCREEN3_GIRL_W, h: SCREEN3_GIRL_H, top: SCREEN3_GIRL_TOP, left: SCREEN3_GIRL_LEFT },
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
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
        <Text style={[s.skipText, { color: theme.primary }]}>{t('onboarding.skip')}</Text>
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
            <View style={s.imgWrap}>
              <View style={[s.stripe, {
                top: slide.stripes.top.top,
                left: slide.stripes.top.left,
                width: slide.stripes.top.width,
                height: slide.stripes.top.height,
                backgroundColor: slide.stripes.top.color,
              }]} />
              <View style={[s.stripe, {
                top: slide.stripes.mid.top,
                left: slide.stripes.mid.left,
                width: slide.stripes.mid.width,
                height: slide.stripes.mid.height,
                backgroundColor: slide.stripes.mid.color,
              }]} />
              <View style={[s.stripe, {
                top: slide.stripes.end.top,
                left: slide.stripes.end.left,
                width: slide.stripes.end.width,
                height: slide.stripes.end.height,
                backgroundColor: slide.stripes.end.color,
              }]} />
              <Image
                source={slide.image}
                style={[s.girl, {
                  width: slide.girl.w,
                  height: slide.girl.h,
                  top: slide.girl.top,
                  left: slide.girl.left,
                }]}
                resizeMode="contain"
              />
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* ── Bottom card ── */}
      <View style={[s.card, { backgroundColor: theme.card }]}>
        <View style={s.titleWrap}>
          {SLIDES.map((slide, index) => {
            const range = [(index - 1) * SW, index * SW, (index + 1) * SW];
            const opacity = scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: 'clamp' });
            const translateY = scrollX.interpolate({ inputRange: range, outputRange: [10, 0, 10], extrapolate: 'clamp' });
            return (
              <Animated.Text
                key={index}
                style={[s.title, {
                  color: theme.text,
                  opacity,
                  transform: [{ translateY }],
                  position: 'absolute',
                  width: '100%',
                }]}
              >
                {t(slide.titleKey)}
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
          title={activeIndex === SLIDES.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
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
  imgWrap: { width: IMG_W, height: IMG_H, overflow: 'visible' },
  stripe: { position: 'absolute', borderRadius: 4, transform: [{ rotate: '-38deg' }], zIndex: 1 },
  girl: { position: 'absolute', zIndex: 3 },
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
