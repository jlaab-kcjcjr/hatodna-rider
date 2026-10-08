import React from 'react';
import Svg, { Defs, Pattern, Rect, Path } from 'react-native-svg';
import { COLORS } from '../theme';

// A woven banig strip: alternating diamonds on an abaca ground.
export default function BanigBand({
  height = 12,
  id = 'banig',
  ground = COLORS.abaca,
  first = COLORS.sili,
  second = COLORS.pili,
}) {
  const h = height;
  const half = h / 2;
  return (
    <Svg width="100%" height={h}>
      <Defs>
        <Pattern id={id} patternUnits="userSpaceOnUse" width={h * 2} height={h}>
          <Rect x="0" y="0" width={h * 2} height={h} fill={ground} />
          <Path d={`M0 ${half} L${half} 0 L${h} ${half} L${half} ${h} Z`} fill={first} />
          <Path d={`M${h} ${half} L${h + half} 0 L${h * 2} ${half} L${h + half} ${h} Z`} fill={second} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height={h} fill={`url(#${id})`} />
    </Svg>
  );
}