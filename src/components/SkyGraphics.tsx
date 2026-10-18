import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { SkyThemeConfig } from '../constants/skyThemes';

const { width } = Dimensions.get('window');

export const SunGraphic: React.FC<{
  type: SkyThemeConfig['sunType'];
  sunColor: string;
  rayColor: string;
}> = ({ type, sunColor, rayColor }) => {
  if (type === 'hidden') {
    return null;
  }
  if (type === 'moon') {
    return (
      <Svg width={84} height={84} viewBox="0 0 140 140" fill="none">
        <Defs>
          <SvgGradient id="moonGlowRing" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#A5C8FF" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#7BA7E8" stopOpacity={0.06} />
          </SvgGradient>
          <SvgGradient id="moonBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FEFCE8" />
            <Stop offset="40%" stopColor="#F0F8FF" />
            <Stop offset="100%" stopColor="#C7D9F5" />
          </SvgGradient>
        </Defs>

        <Circle cx={70} cy={70} r={60} fill="url(#moonGlowRing)" />
        <Circle cx={70} cy={70} r={50} fill="rgba(165, 200, 255, 0.10)" />

        <Path
          d="M88 28C66.5 28 49 45.5 49 67C49 88.5 66.5 106 88 106C93.4 106 98.5 104.8 103.1 102.6C93.8 110.5 81.4 115 68 115C41.5 115 20 93.5 20 67C20 40.5 41.5 19 68 19C81.4 19 93.8 23.5 103.1 31.4C98.5 29.2 93.4 28 88 28Z"
          fill="url(#moonBodyGrad)"
        />

        <Path
          d="M88 32C68.2 32 52 48.3 52 67C52 85.7 68.2 102 88 102C92.2 102 96.2 101.1 99.8 99.5C91 106.5 79.9 110.5 68 110.5C43.9 110.5 24.5 91.1 24.5 67C24.5 42.9 43.9 23.5 68 23.5C79.9 23.5 91 27.5 99.8 34.5C96.2 32.9 92.2 32 88 32Z"
          fill="rgba(100, 140, 200, 0.15)"
        />

        <Path d="M118 32L119.4 36.2L123.8 37.6L119.4 39L118 43.2L116.6 39L112.2 37.6L116.6 36.2Z" fill="#FDE68A" opacity={0.95} />
        <Path d="M30 40L31 43L34 44L31 45L30 48L29 45L26 44L29 43Z" fill="#FFFFFF" opacity={0.80} />
        <Path d="M110 88L110.8 90.4L113.2 91.2L110.8 92L110 94.4L109.2 92L106.8 91.2L109.2 90.4Z" fill="#E0F0FF" opacity={0.70} />

        <Circle cx={72} cy={58} r={3.5} fill="rgba(140, 170, 210, 0.25)" />
        <Circle cx={60} cy={72} r={2.5} fill="rgba(140, 170, 210, 0.20)" />
        <Circle cx={78} cy={78} r={2.0} fill="rgba(140, 170, 210, 0.18)" />
      </Svg>
    );
  }

  return (
    <Svg width={72} height={72} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="sunBodyGradHeader" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF7ED" />
          <Stop offset="45%" stopColor={sunColor} />
          <Stop offset="100%" stopColor="#EA580C" />
        </SvgGradient>
      </Defs>

      <Circle cx={60} cy={60} r={48} fill={rayColor} opacity={0.35} />
      <Circle cx={60} cy={60} r={38} fill={rayColor} opacity={0.45} />

      <G stroke={sunColor} strokeWidth={3.5} strokeLinecap="round" opacity={0.85}>
        <Path d="M60 10L60 2" />
        <Path d="M60 110L60 118" />
        <Path d="M10 60L2 60" />
        <Path d="M110 60L118 60" />

        <Path d="M25 25L19 19" />
        <Path d="M95 95L101 101" />
        <Path d="M25 95L19 101" />
        <Path d="M95 25L101 19" />
      </G>

      <Circle cx={60} cy={60} r={23} fill="url(#sunBodyGradHeader)" />
    </Svg>
  );
};

export const FajrBirds: React.FC<{ topInset: number }> = ({ topInset }) => (
  <Svg
    width={width}
    height={100}
    viewBox={`0 0 ${width} 100`}
    fill="none"
    style={{ position: 'absolute', top: topInset + 28, left: 0 }}
  >
    <Path
      d="M52 38 Q58 32 64 38 Q70 32 76 38"
      stroke="rgba(255, 250, 245, 0.90)"
      strokeWidth={2.2}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M24 26 Q28 21 32 26 Q36 21 40 26"
      stroke="rgba(255, 250, 245, 0.75)"
      strokeWidth={1.8}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M88 18 Q91 14 94 18 Q97 14 100 18"
      stroke="rgba(255, 250, 245, 0.58)"
      strokeWidth={1.4}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M130 30 Q135 25 140 30 Q145 25 150 30"
      stroke="rgba(255, 250, 245, 0.68)"
      strokeWidth={1.7}
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M108 10 Q110.5 7 113 10 Q115.5 7 118 10"
      stroke="rgba(255, 250, 245, 0.48)"
      strokeWidth={1.2}
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

export const FajrCloud: React.FC<{ topInset: number }> = ({ topInset }) => (
  <Svg
    width={180}
    height={52}
    viewBox="0 0 180 52"
    fill="none"
    style={{ position: 'absolute', top: topInset + 70, left: width * 0.15 }}
  >
    <Defs>
      <SvgGradient id="cloudDawnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#2A1F45" stopOpacity={0.55} />
        <Stop offset="60%" stopColor="#5C2D5E" stopOpacity={0.42} />
        <Stop offset="100%" stopColor="#E8603A" stopOpacity={0.28} />
      </SvgGradient>
    </Defs>
    <Path
      d="M20 38 Q8 38 8 28 Q8 18 20 18 Q22 10 34 10 Q44 2 58 8 Q68 2 80 8 Q96 0 110 10 Q124 4 136 14 Q152 10 160 22 Q172 22 172 32 Q172 42 160 42 Q140 48 120 44 Q100 50 80 46 Q60 50 40 46 Q24 48 20 38Z"
      fill="url(#cloudDawnGrad)"
    />
    <Path
      d="M30 42 Q50 46 70 44 Q90 48 110 44 Q130 46 150 42"
      stroke="rgba(232, 96, 58, 0.20)"
      strokeWidth={1}
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);
