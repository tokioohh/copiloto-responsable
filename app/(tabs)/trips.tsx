import { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useTripStore } from '../../src/stores/tripStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function TripsScreen() {
  const user = useAuthStore((state) => state.user);
  const { trips, loading, loadTrips } = useTripStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadTrips(user.uid);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No hay viajes registrados
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Comienza a conducir y tus viajes aparecerán aquí
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const date = item.startTime.toDate();
        const scoreColor = item.score.total >= 80 ? '#4CAF50' : item.score.total >= 60 ? '#FFC107' : '#F44336';

        return (
          <Card
            style={styles.card}
            onPress={() => router.push(`/trip/${item.id}`)}
          >
            <Card.Content>
              <View style={styles.cardHeader}>
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
                  {item.score.total}
                </Chip>
              </View>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Duración
                  </Text>
                  <Text variant="bodyMedium">
                    {Math.floor(item.duration / 60)} min
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Distancia
                  </Text>
                  <Text variant="bodyMedium">
                    {item.distance.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Eventos
                  </Text>
                  <Text variant="bodyMedium">{item.events.length}</Text>
                </View>
              </View>

              {item.dismissed && (
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
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
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
