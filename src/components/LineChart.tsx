import { useTheme } from '@/theme/ThemeContext';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

type DataPoint = { label: string; value: number };

type Props = {
  data: DataPoint[];
  width: number;
  height?: number;
  showDots?: boolean;
  showLabels?: boolean;
};

export default function LineChart({
  data,
  width,
  height = 140,
  showDots = true,
  showLabels = true,
}: Props) {
  const { theme } = useTheme();

  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const paddingH = 24;
  const paddingTop = 16;
  const paddingBottom = showLabels ? 28 : 8;
  const innerW = width - paddingH * 2;
  const innerH = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const toX = (i: number) => paddingH + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => paddingTop + innerH - ((v - minVal) / range) * innerH;

  // Build smooth path
  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2;
    d += ` C ${cp1x} ${points[i - 1].y}, ${cp1x} ${points[i].y}, ${points[i].x} ${points[i].y}`;
  }

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t, i) => {
        const y = paddingTop + innerH * (1 - t);
        return (
          <Line
            key={i}
            x1={paddingH}
            y1={y}
            x2={width - paddingH}
            y2={y}
            stroke={theme.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        );
      })}

      {/* Line */}
      <Path d={d} stroke={theme.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />

      {/* Dots */}
      {showDots &&
        points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={theme.primary} />
        ))}

      {/* X-axis labels */}
      {showLabels &&
        data.map((dp, i) => (
          <SvgText
            key={i}
            x={toX(i)}
            y={height - 4}
            fontSize={10}
            fill={theme.textSecondary}
            textAnchor="middle"
          >
            {dp.label}
          </SvgText>
        ))}
    </Svg>
  );
}
