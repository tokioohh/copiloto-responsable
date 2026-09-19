import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { scoreToStars, getScoreColor } from '../utils/scoring';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showStars?: boolean;
  subtitle?: string;
}

export default function ScoreGauge({
  score,
  size = 170,
  showStars = true,
  subtitle = 'Puntaje de Conducción',
}: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const stars = scoreToStars(score);

  const getQualitativeRating = (s: number) => {
    if (s >= 90) return 'Excelente';
    if (s >= 75) return 'Muy Bueno';
    if (s >= 60) return 'Aceptable';
    return 'A Mejorar';
  };

  const ratingLabel = getQualitativeRating(score);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.gaugeOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: `${color}33`, // 20% opacity border
          },
        ]}
      >
        <View
          style={[
            styles.gaugeInner,
            {
              width: size - 24,
              height: size - 24,
              borderRadius: (size - 24) / 2,
              borderColor: color,
            },
          ]}
        >
          <Text
            variant="displayLarge"
            style={[styles.scoreText, { color, fontSize: size * 0.32 }]}
          >
            {score}
          </Text>
          <Text variant="labelSmall" style={styles.scoreUnit}>
            / 100
          </Text>
        </View>
      </View>

      <Text variant="bodyMedium" style={styles.subtitleText}>
        {subtitle}
      </Text>

      <View style={styles.badgeRow}>
        <Chip
          compact
          mode="flat"
          style={[styles.ratingChip, { backgroundColor: `${color}1A` }]}
          textStyle={[styles.ratingChipText, { color }]}
        >
          {ratingLabel}
        </Chip>
      </View>

      {showStars && (
        <View style={styles.stars}>
          <Text style={styles.starsText}>{'⭐'.repeat(stars)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  gaugeOuter: {
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFC',
  },
  gaugeInner: {
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontWeight: 'bold',
    lineHeight: 56,
  },
  scoreUnit: {
    color: '#888888',
    marginTop: -4,
  },
  subtitleText: {
    color: '#666666',
    marginTop: 10,
    fontWeight: '500',
  },
  badgeRow: {
    marginTop: 6,
  },
  ratingChip: {
    height: 26,
    borderRadius: 13,
  },
  ratingChipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  stars: {
    marginTop: 8,
  },
  starsText: {
    fontSize: 20,
    letterSpacing: 2,
  },
});
