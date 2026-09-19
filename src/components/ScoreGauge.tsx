import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { scoreToStars, getScoreColor } from '../utils/scoring';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showStars?: boolean;
}

export default function ScoreGauge({ score, size = 180, showStars = true }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const stars = scoreToStars(score);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.gauge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
          },
        ]}
      >
        <Text
          variant="displayLarge"
          style={[styles.scoreText, { color, fontSize: size * 0.35 }]}
        >
          {score}
        </Text>
      </View>
      {showStars && (
        <View style={styles.stars}>
          <Text variant="headlineSmall" style={styles.starsText}>
            {'⭐'.repeat(stars)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  gauge: {
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontWeight: 'bold',
  },
  stars: {
    marginTop: 12,
  },
  starsText: {
    fontSize: 24,
  },
});
