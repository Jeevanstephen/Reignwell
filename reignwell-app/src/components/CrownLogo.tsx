import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  crownSize?: number;
  fontSize?: number;
  color?: string;
}

export default function CrownLogo({ crownSize = 60, fontSize = 22, color = '#111111' }: Props) {
  const scale = crownSize / 500;
  return (
    <View style={styles.container}>
      <Svg width={crownSize} height={crownSize * (283 / 500)} viewBox="0 0 500 283">
        <Path
          d="M52,268 C54,255 60,246 70,240 L72,18 Q95,120 125,138 Q148,88 172,66 Q192,120 207,145 L250,10 L293,145 Q308,120 328,66 Q352,88 375,138 Q405,120 428,18 L430,240 C440,246 446,255 448,268 Z M231,249 C231,235 240,225 250,225 C260,225 269,235 269,249 C269,263 260,273 250,273 C240,273 231,263 231,249 Z"
          fill={color}
        />
      </Svg>
      <Text style={[styles.wordmark, { fontSize, color }]}>REIGNWELL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10 },
  wordmark: {
    fontWeight: '700',
    letterSpacing: 5,
  },
});
