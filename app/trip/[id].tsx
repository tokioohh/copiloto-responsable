import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trip } from '../../src/types/trip';
import { firebaseService } from '../../src/services/firebaseService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    if (!id) return;
    setLoading(true);
    const tripData = await firebaseService.getTrip(id);
    setTrip(tripData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">Viaje no encontrado</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }

  const date = trip.startTime.toDate();
  const scoreColor =
    trip.score.total >= 80 ? '#4CAF50' : trip.score.total >= 60 ? '#FFC107' : '#F44336';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">
            {format(date, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </Text>
          <Text variant="bodyMedium" style={styles.time}>
            {format(date, 'HH:mm')} - {format(trip.endTime.toDate(), 'HH:mm')}
          </Text>
        </Card.Content>
      </Card>

      {/* Score */}
      <Card style={styles.card}>
        <Card.Content style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text variant="displayLarge" style={[styles.scoreText, { color: scoreColor }]}>
              {trip.score.total}
            </Text>
          </View>
          <Text variant="titleMedium" style={styles.scoreLabel}>
            Puntaje del Viaje
          </Text>
        </Card.Content>
      </Card>

      {/* Score Breakdown */}
      <Card style={styles.card}>
        <Card.Title title="Desglose de Puntaje" />
        <Card.Content>
          <View style={styles.breakdown}>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium">Frenado</Text>
              <Text variant="titleMedium">{trip.score.breakdown.braking}/30</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium">Aceleración</Text>
              <Text variant="titleMedium">{trip.score.breakdown.acceleration}/25</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium">Velocidad</Text>
              <Text variant="titleMedium">{trip.score.breakdown.speed}/20</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium">Giros</Text>
              <Text variant="titleMedium">{trip.score.breakdown.turning}/15</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text variant="bodyMedium">Teléfono</Text>
              <Text variant="titleMedium">{trip.score.breakdown.phoneUsage}/10</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Metrics */}
      <Card style={styles.card}>
        <Card.Title title="Métricas del Viaje" />
        <Card.Content>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall">{Math.floor(trip.duration / 60)}</Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Minutos
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall">{trip.distance.toFixed(1)}</Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Kilómetros
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall">
                {trip.metrics.averageSpeed.toFixed(0)}
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Vel. Promedio
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall">{trip.metrics.maxSpeed.toFixed(0)}</Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Vel. Máxima
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Events Summary */}
      <Card style={styles.card}>
        <Card.Title title="Eventos de Conducción" />
        <Card.Content>
          <View style={styles.eventsRow}>
            <Chip icon="car-brake-alert" style={styles.eventChip}>
              {trip.metrics.harshBrakes} Frenados bruscos
            </Chip>
            <Chip icon="car-speed-limiter" style={styles.eventChip}>
              {trip.metrics.harshAccels} Aceleraciones bruscas
            </Chip>
            <Chip icon="steering" style={styles.eventChip}>
              {trip.metrics.sharpTurns} Giros bruscos
            </Chip>
            {trip.metrics.speedingDuration > 0 && (
              <Chip icon="speedometer" style={styles.eventChip}>
                {Math.floor(trip.metrics.speedingDuration / 60)} min a exceso
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Route Map Placeholder - Sprint 4 */}
      <Card style={styles.card}>
        <Card.Title title="Ruta del Viaje" />
        <Card.Content>
          <View style={styles.mapPlaceholder}>
            <Text variant="bodyMedium" style={styles.placeholderText}>
              Sprint 4: Mapa de ruta
            </Text>
            <Text variant="bodySmall" style={styles.placeholderSubtext}>
              {trip.route.length} puntos de ruta registrados
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  time: {
    color: '#666',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#666',
  },
  breakdown: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  metricBox: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  metricLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  eventsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventChip: {
    marginBottom: 8,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
  },
  placeholderSubtext: {
    color: '#999',
    marginTop: 4,
  },
});
