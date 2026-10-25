import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../store/hooks';

export interface SheetOption {
  label: string;
  value: string;
  subtitle?: string;
  badge?: string;
  icon?: string;
}

export interface AppOptionPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: SheetOption[];
  selected?: string;
  onSelect: (value: string) => void;
  snapPoints?: string[];
}

export const AppOptionPickerSheet: React.FC<AppOptionPickerSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  snapPoints: customSnapPoints,
}) => {
  const { colors, isDarkMode } = useTheme();
  const accent = colors.primary;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const defaultSnapPoints = useMemo(() => {
    if (options.length <= 3) return ['42%'];
    if (options.length <= 5) return ['55%'];
    return ['68%'];
  }, [options.length]);

  const snapPoints = customSnapPoints || defaultSnapPoints;

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onDismiss={onClose}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor: isDarkMode ? '#05142E' : colors.surface,
          borderColor: isDarkMode ? '#1E3A6E' : colors.border,
        },
      ]}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : '#CBD5E1' },
      ]}
    >
      <View style={styles.sheetContainer}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDarkMode ? '#1E3A6E' : colors.border }]}>
          <View style={styles.headerTextWrap}>
            <Text
              style={[
                styles.title,
                { color: isDarkMode ? '#FFFFFF' : colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  { color: isDarkMode ? '#94A3B8' : colors.textSecondary },
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.dismiss()}
            style={[
              styles.closeBtn,
              { backgroundColor: isDarkMode ? '#112240' : colors.surfaceSecondary },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="close"
              size={16}
              color={isDarkMode ? '#E2E8F0' : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Options */}
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {options.map((opt) => {
            const isSelected = opt.value === selected;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={0.7}
                onPress={() => {
                  onSelect(opt.value);
                  bottomSheetModalRef.current?.dismiss();
                }}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? 'rgba(96, 165, 250, 0.15)'
                        : accent + '14'
                      : isDarkMode
                      ? '#081C3D'
                      : colors.surfaceSecondary,
                    borderColor: isSelected
                      ? isDarkMode
                        ? '#3B82F6'
                        : accent
                      : isDarkMode
                      ? '#1E3A6E'
                      : colors.border,
                  },
                ]}
              >
                <View style={styles.optionLeft}>
                  {opt.icon ? (
                    <View
                      style={[
                        styles.iconCircle,
                        {
                          backgroundColor: isSelected
                            ? accent + '25'
                            : isDarkMode
                            ? '#1E293B'
                            : '#E2E8F0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.iconText,
                          { color: isSelected ? accent : colors.textSecondary },
                        ]}
                      >
                        {opt.icon}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.optionTextCol}>
                    <View style={styles.labelRow}>
                      <Text
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected
                              ? isDarkMode
                                ? '#60A5FA'
                                : accent
                              : isDarkMode
                              ? '#FFFFFF'
                              : colors.textPrimary,
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {opt.badge ? (
                        <View style={[styles.badge, { backgroundColor: accent + '20' }]}>
                          <Text style={[styles.badgeText, { color: accent }]}>
                            {opt.badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    {opt.subtitle ? (
                      <Text
                        style={[
                          styles.optionSubtitle,
                          { color: isDarkMode ? '#94A3B8' : colors.textSecondary },
                        ]}
                      >
                        {opt.subtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Radio Indicator */}
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: isSelected
                        ? accent
                        : isDarkMode
                        ? '#475569'
                        : '#CBD5E1',
                    },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: accent }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
  },
  handleIndicator: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    marginTop: 6,
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '400',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionTextCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14.5,
    letterSpacing: -0.1,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  optionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
