import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trip } from '../../src/types/trip';
import { firebaseService } from '../../src/services/firebaseService';
import { useTripStore } from '../../src/stores/tripStore';
import ScoreGauge from '../../src/components/ScoreGauge';
import EventTimeline from '../../src/components/EventTimeline';
import DismissTripButton from '../../src/components/DismissTripButton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toJsDate, toMillis } from '../../src/utils/dateUtils';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(false);

  const dismissTripInStore = useTripStore((state) => state.dismissTrip);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    if (!id) return;
    setLoading(true);

    // 1. Check local trip store cache first (instant 0ms render)
    const cachedTrip = useTripStore
      .getState()
      .trips.find((t) => t.id === id);

    if (cachedTrip) {
      setTrip(cachedTrip);
      setLoading(false);
      return;
    }

    // 2. Fetch from Firestore if not in memory
    try {
      const tripData = await firebaseService.getTrip(id);
      setTrip(tripData);
    } catch (err) {
      console.warn('[TripDetail] Could not fetch trip from Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (!trip) return;

    Alert.alert(
      '¿No eras el conductor?',
      'Este viaje será marcado como "No conduciendo" y su puntaje se excluirá de tus estadísticas globales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              setDismissing(true);
              await dismissTripInStore(trip.id);
              setTrip((prev) => (prev ? { ...prev, dismissed: true } : prev));
            } catch (err) {
              Alert.alert('Error', 'No se pudo actualizar el estado del viaje.');
            } finally {
              setDismissing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium">Viaje no encontrado</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Volver
        </Button>
      </View>
    );
  }

  const startDate = toJsDate(trip.startTime);
  const endDate = toJsDate(trip.endTime);
  const tripStartMillis = toMillis(trip.startTime);

  const { breakdown } = trip.score;

  return (
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text variant="headlineSmall" style={styles.tripDateTitle}>
                {format(startDate, "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
              <Text variant="bodyMedium" style={styles.timeRange}>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} ({Math.max(1, Math.floor(trip.duration / 60))} min)
              </Text>
            </View>

            {trip.dismissed && (
              <Chip
                mode="flat"
                style={styles.dismissedBadge}
                textStyle={styles.dismissedBadgeText}
                icon="account-off"
              >
                No conduciendo
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Score Gauge */}
      <Card style={styles.card}>
        <Card.Content>
          <ScoreGauge
            score={trip.score.total}
            size={180}
            subtitle="Puntaje de Este Viaje"
          />
        </Card.Content>
      </Card>

      {/* Score Breakdown with Progress Bars */}
      <Card style={styles.card}>
        <Card.Title title="Desglose por Categoría" />
        <Card.Content>
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text variant="bodyMedium" style={styles.breakdownLabel}>
                Frenado Suave
              </Text>
              <Text variant="titleSmall" style={styles.breakdownValue}>
                {breakdown.braking} / 30 pts
              </Text>
            </View>
            <ProgressBar
              progress={breakdown.braking / 30}
              color={breakdown.braking >= 25 ? '#4CAF50' : breakdown.braking >= 18 ? '#FFB300' : '#E53935'}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text variant="bodyMedium" style={styles.breakdownLabel}>
                Aceleración Progresiva
              </Text>
              <Text variant="titleSmall" style={styles.breakdownValue}>
                {breakdown.acceleration} / 25 pts
              </Text>
            </View>
            <ProgressBar
              progress={breakdown.acceleration / 25}
              color={breakdown.acceleration >= 20 ? '#4CAF50' : breakdown.acceleration >= 15 ? '#FFB300' : '#E53935'}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text variant="bodyMedium" style={styles.breakdownLabel}>
                Velocidad Regulada
              </Text>
              <Text variant="titleSmall" style={styles.breakdownValue}>
                {breakdown.speed} / 20 pts
              </Text>
            </View>
            <ProgressBar
              progress={breakdown.speed / 20}
              color={breakdown.speed >= 16 ? '#4CAF50' : breakdown.speed >= 12 ? '#FFB300' : '#E53935'}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text variant="bodyMedium" style={styles.breakdownLabel}>
                Giros Controlados
              </Text>
              <Text variant="titleSmall" style={styles.breakdownValue}>
                {breakdown.turning} / 15 pts
              </Text>
            </View>
            <ProgressBar
              progress={breakdown.turning / 15}
              color={breakdown.turning >= 12 ? '#4CAF50' : breakdown.turning >= 9 ? '#FFB300' : '#E53935'}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <Text variant="bodyMedium" style={styles.breakdownLabel}>
                Atención al Volante
              </Text>
              <Text variant="titleSmall" style={styles.breakdownValue}>
                {breakdown.phoneUsage} / 10 pts
              </Text>
            </View>
            <ProgressBar
              progress={breakdown.phoneUsage / 10}
              color="#4CAF50"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Metrics Grid */}
      <Card style={styles.card}>
        <Card.Title title="Métricas del Recorrido" />
        <Card.Content>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text variant="titleLarge" style={styles.metricBigVal}>
                {Math.floor(trip.duration / 60)}m {trip.duration % 60}s
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Duración
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="titleLarge" style={styles.metricBigVal}>
                {trip.distance.toFixed(2)} km
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Distancia
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="titleLarge" style={styles.metricBigVal}>
                {Math.round(trip.metrics.averageSpeed)} km/h
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Vel. Promedio
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="titleLarge" style={styles.metricBigVal}>
                {Math.round(trip.metrics.maxSpeed)} km/h
              </Text>
              <Text variant="bodySmall" style={styles.metricLabel}>
                Vel. Máxima
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Events Timeline */}
      <Card style={styles.card}>
        <Card.Title
          title="Línea de Tiempo de Eventos"
          subtitle={`${trip.events.length} maniobras detectadas`}
        />
        <Card.Content>
          <EventTimeline
            events={trip.events}
            tripStartTime={tripStartMillis}
          />
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          {!trip.dismissed ? (
            <DismissTripButton
              onPress={handleDismiss}
              loading={dismissing}
            />
          ) : (
            <Text variant="bodySmall" style={styles.dismissedNote}>
              Este viaje fue marcado como pasajero. No afecta tu calificación ni métricas globales.
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F7',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDateTitle: {
    fontWeight: 'bold',
    color: '#212121',
  },
  timeRange: {
    color: '#666666',
    marginTop: 4,
  },
  dismissedBadge: {
    backgroundColor: '#FFF3E0',
  },
  dismissedBadgeText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: 'bold',
  },
  breakdownItem: {
    marginBottom: 14,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    color: '#555555',
  },
  breakdownValue: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  metricBigVal: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  metricLabel: {
    color: '#757575',
    marginTop: 4,
  },
  dismissedNote: {
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
});
