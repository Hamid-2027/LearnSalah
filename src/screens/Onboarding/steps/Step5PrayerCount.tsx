/**
 * Step 5 – Daily Prayer Count (Horizontal Snap Wheel)
 * "How many times do you pray a day?"
 * Numbers 0-5 displayed in a snap-scroll picker.
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  BotBubble,
  OnboardingProgressBar,
  PillButton,
  C,
} from '../components/OnboardingShared';
import { useOnboarding } from '../../../store/hooks';

const { width: SW } = Dimensions.get('window');
const ITEM_W = 90;
const ITEMS = [0, 1, 2, 3, 4, 5];

interface Props {
  onNext: () => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

export default function Step5PrayerCount({ onNext, onBack, stepIndex, totalSteps }: Props) {
  const { dailyPrayersCount, saveDailyPrayersCount } = useOnboarding();
  const [selected, setSelected] = useState(dailyPrayersCount);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const centerPadding = (SW - ITEM_W) / 2;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    // Scroll to current selection
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: selected * ITEM_W, animated: false });
    }, 100);
  }, []);

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / ITEM_W);
    const clamped = Math.min(Math.max(idx, 0), ITEMS.length - 1);
    if (clamped !== selected) setSelected(clamped);
  };

  const handleNext = () => {
    saveDailyPrayersCount(selected);
    onNext();
  };

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      <OnboardingProgressBar current={stepIndex} total={totalSteps} />

      <View style={{ flex: 1, paddingTop: 24 }}>
        <BotBubble>How many times do you pray a day?</BotBubble>

        {/* Horizontal snap wheel */}
        <View style={s.pickerContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_W}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{
              paddingHorizontal: centerPadding,
              alignItems: 'center',
            }}
          >
            {ITEMS.map((num) => {
              const isSelected = num === selected;
              return (
                <View key={num} style={s.itemWrapper}>
                  <View style={[s.item, isSelected && s.itemActive]}>
                    <Text style={[s.itemText, isSelected && s.itemTextActive]}>
                      {num}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Centre highlight frame */}
          <View pointerEvents="none" style={s.centerFrame} />
        </View>

        {/* Helper labels */}
        <Text style={s.hint}>
          {selected === 0
            ? "That's okay — we're here to help you start!"
            : selected === 5
            ? "Masha'Allah! All 5 daily prayers!"
            : `${selected} out of 5 — keep going!`}
        </Text>
      </View>

      <View style={s.footer}>
        <PillButton label="Next" onPress={handleNext} style={s.btn} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  pickerContainer: {
    height: 130,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 24,
  },
  itemWrapper: {
    width: ITEM_W,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    width: 72,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  itemActive: {
    backgroundColor: C.bgCard,
    shadowColor: C.cyan,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  itemText: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 38,
    fontWeight: '700',
  },
  itemTextActive: {
    color: C.cyan,
    fontSize: 54,
    fontWeight: '900',
  },
  centerFrame: {
    position: 'absolute',
    left: SW / 2 - ITEM_W / 2,
    top: 0,
    bottom: 0,
    width: ITEM_W,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(34,211,238,0.15)',
  },
  hint: {
    color: C.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 32 },
  btn: { width: '100%' },
});
