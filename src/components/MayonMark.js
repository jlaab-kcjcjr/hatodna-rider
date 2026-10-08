import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../theme';

// Mayon's near-perfect cone, with the sun rising behind it.
export default function MayonMark({ width = 220, color = COLORS.siliDeep, sun = COLORS.abaca }) {
  const height = width * 0.5;
  return (
    <Svg width={width} height={height} viewBox="0 0 200 100">
      <Circle cx="132" cy="44" r="22" fill={sun} />
      <Path d="M0 100 C55 96 84 46 96 20 Q100 13 104 20 C116 46 145 96 200 100 Z" fill={color} />
      <Path
        d="M99 12 C96 8 101 5 98 1"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
    </Svg>
  );
}