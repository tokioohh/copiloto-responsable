import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Trip } from '../types/trip';
import { getScoreColor } from '../utils/scoring';
import { toJsDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export default function TripCard({ trip, onPress }: TripCardProps) {
  const date = toJsDate(trip.startTime);
  const scoreColor = getScoreColor(trip.score.total);


  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium">
              {format(date, "d 'de' MMMM", { locale: es })}
            </Text>
            <Text variant="bodySmall" style={styles.time}>
              {format(date, 'HH:mm')}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={[styles.scoreChip, { backgroundColor: scoreColor }]}
            textStyle={styles.scoreChipText}
          >
            {trip.score.total}
          </Chip>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text variant="bodySmall" style={styles.metricLabel}>
              Duración
            </Text>
            <Text variant="bodyMedium">{Math.floor(trip.duration / 60)} min</Text>
          </View>
          <View style={styles.metric}>
            <Text variant="bodySmall" style={styles.metricLabel}>
              Distancia
            </Text>
            <Text variant="bodyMedium">{trip.distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.metric}>
            <Text variant="bodySmall" style={styles.metricLabel}>
              Eventos
            </Text>
            <Text variant="bodyMedium">{trip.events.length}</Text>
          </View>
        </View>

        {trip.dismissed && (
          <Chip
            mode="outlined"
            style={styles.dismissedChip}
            textStyle={styles.dismissedText}
            icon="account-off"
          >
            No conduciendo
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    color: '#666',
    marginTop: 4,
  },
  scoreChip: {
    height: 48,
    width: 48,
    borderRadius: 24,
    justifyContent: 'center',
  },
  scoreChipText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#666',
    marginBottom: 4,
  },
  dismissedChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  dismissedText: {
    fontSize: 12,
  },
});
