import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useAuthStore } from '../../src/stores/authStore';
import { useTripStore } from '../../src/stores/tripStore';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const activeTrip = useTripStore((state) => state.activeTrip);
  const startTrip = useTripStore((state) => state.startTrip);
  const endTrip = useTripStore((state) => state.endTrip);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">
          Hola, {user?.displayName || 'Conductor'}
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {activeTrip ? 'Viaje en progreso' : 'Listo para conducir'}
        </Text>
      </View>

      {/* Score Gauge - Sprint 4 */}
      <Card style={styles.card}>
        <Card.Content style={styles.scoreContainer}>
          <View style={styles.scorePlaceholder}>
            <Text variant="displayLarge" style={styles.scoreText}>
              --
            </Text>
            <Text variant="bodyMedium" style={styles.scoreLabel}>
              Puntaje Semanal
            </Text>
          </View>
          <Text variant="bodySmall" style={styles.comingSoon}>
            Sprint 4: Score gauge & trends
          </Text>
        </Card.Content>
      </Card>

      {/* Weekly Summary - Sprint 4 */}
      <Card style={styles.card}>
        <Card.Title title="Resumen Semanal" />
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{user?.stats.totalTrips || 0}</Text>
              <Text variant="bodySmall">Viajes</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{user?.stats.totalDistance.toFixed(0) || 0}</Text>
              <Text variant="bodySmall">Kilómetros</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall">{user?.stats.averageScore.toFixed(0) || 0}</Text>
              <Text variant="bodySmall">Promedio</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Active Trip Controls - Sprint 2-3 */}
      <Card style={styles.card}>
        <Card.Content>
          {activeTrip ? (
            <View>
              <Text variant="titleMedium" style={styles.tripStatus}>
                Viaje en progreso...
              </Text>
              <Text variant="bodyMedium" style={styles.tripInfo}>
                Duración: {Math.floor(activeTrip.currentDuration / 60)} min
              </Text>
              <Text variant="bodyMedium" style={styles.tripInfo}>
                Distancia: {activeTrip.currentDistance.toFixed(1)} km
              </Text>
              <Button mode="contained" onPress={endTrip} style={styles.button}>
                Terminar Viaje
              </Button>
            </View>
          ) : (
            <View>
              <Text variant="bodyMedium" style={styles.infoText}>
                Los viajes se detectan automáticamente cuando comienzas a conducir
              </Text>
              <Button mode="outlined" onPress={startTrip} style={styles.button}>
                Iniciar Viaje Manualmente
              </Button>
            </View>
          )}
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
  header: {
    padding: 24,
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scorePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#666',
  },
  scoreLabel: {
    color: '#666',
  },
  comingSoon: {
    color: '#999',
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  tripStatus: {
    marginBottom: 16,
    textAlign: 'center',
  },
  tripInfo: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginTop: 16,
  },
});
