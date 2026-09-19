import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useTripStore } from '../../src/stores/tripStore';
import { useTripTracking } from '../../src/hooks/useTripTracking';
import { useSensorData } from '../../src/hooks/useSensorData';
import ScoreGauge from '../../src/components/ScoreGauge';
import TrendChart from '../../src/components/TrendChart';
import TripCard from '../../src/components/TripCard';
import { toJsDate } from '../../src/utils/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { trips, loadTrips } = useTripStore();

  useEffect(() => {
    if (user?.uid) {
      loadTrips(user.uid);
    }
  }, [user?.uid]);

  const {
    activeTrip,
    isTracking,
    detectorState,
    countdown,
    currentSpeed,
    simulationSpeed,
    startManualTrip,
    endCurrentTrip,
    startSimulation,
    stopSimulation,
    injectTestEvent,
  } = useTripTracking();

  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { accelerometer, gyroscope } = useSensorData(showDiagnostics);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const harshBrakes =
    activeTrip?.eventBuffer.filter((e) => e.type === 'harsh_brake').length || 0;
  const harshAccels =
    activeTrip?.eventBuffer.filter((e) => e.type === 'harsh_accel').length || 0;
  const sharpTurns =
    activeTrip?.eventBuffer.filter((e) => e.type === 'sharp_turn').length || 0;

  // Filter valid (non-dismissed) trips for visualization
  const validTrips = trips.filter((t) => !t.dismissed);
  const recentTripsChronological = [...validTrips].slice(0, 6).reverse();
  const trendScores = recentTripsChronological.map((t) => t.score.total);
  const trendLabels = recentTripsChronological.map((t) => {
    const d = toJsDate(t.startTime);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const latestTrip = validTrips.length > 0 ? validTrips[0] : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium">
          Hola, {user?.displayName || 'Conductor'}
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          {detectorState === 'active'
            ? 'En viaje activo'
            : detectorState === 'starting'
            ? 'Detectando inicio de viaje...'
            : detectorState === 'ending'
            ? 'Detenido (finalizando...)'
            : 'Listo para conducir'}
        </Text>
      </View>

      {/* Dynamic Driving Card */}
      <Card style={styles.card}>
        <Card.Content>
          {/* Status Header */}
          <View style={styles.statusRow}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Monitoreo de Manejo
            </Text>
            <Chip
              icon={
                detectorState === 'active'
                  ? 'car-speed-limiter'
                  : detectorState === 'starting' || detectorState === 'ending'
                  ? 'timer-sand'
                  : 'satellite-uplink'
              }
              style={[
                styles.chip,
                detectorState === 'active'
                  ? styles.chipActive
                  : detectorState === 'starting' || detectorState === 'ending'
                  ? styles.chipWarning
                  : styles.chipIdle,
              ]}
              textStyle={styles.chipText}
            >
              {detectorState === 'active'
                ? 'VIAJE EN CURSO'
                : detectorState === 'starting'
                ? `INICIANDO (${countdown}s)`
                : detectorState === 'ending'
                ? `TERMINANDO (${countdown}s)`
                : isTracking
                ? 'GPS ACTIVO'
                : 'STANDBY'}
            </Chip>
          </View>

          {/* Active Trip Telemetry View */}
          {detectorState === 'active' && activeTrip ? (
            <View style={styles.activeContainer}>
              <View style={styles.speedometer}>
                <Text variant="displayMedium" style={styles.speedValue}>
                  {Math.round(currentSpeed)}
                </Text>
                <Text variant="labelMedium" style={styles.speedUnit}>
                  km/h
                </Text>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {formatDuration(activeTrip.currentDuration)}
                  </Text>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    Duración
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text variant="titleLarge" style={styles.metricValue}>
                    {activeTrip.currentDistance.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={styles.metricLabel}>
                    km Recorridos
                  </Text>
                </View>
              </View>

              {/* Event Counter Badges */}
              {(harshBrakes > 0 || harshAccels > 0 || sharpTurns > 0) && (
                <View style={styles.eventBadgesRow}>
                  {harshBrakes > 0 && (
                    <Chip compact style={styles.eventChip}>
                      Frenadas: {harshBrakes}
                    </Chip>
                  )}
                  {harshAccels > 0 && (
                    <Chip compact style={styles.eventChip}>
                      Aceleradas: {harshAccels}
                    </Chip>
                  )}
                  {sharpTurns > 0 && (
                    <Chip compact style={styles.eventChip}>
                      Giros: {sharpTurns}
                    </Chip>
                  )}
                </View>
              )}

              {/* Maneuver Injection Tools for Active Trip */}
              <View style={styles.maneuverContainer}>
                <Text variant="labelSmall" style={styles.maneuverTitle}>
                  PROBAR EVENTOS DE MANEJO:
                </Text>
                <View style={styles.maneuverButtons}>
                  <Button
                    mode="outlined"
                    compact
                    textColor="#C62828"
                    onPress={() => injectTestEvent('harsh_brake')}
                    style={styles.maneuverBtn}
                  >
                    Frenada (-5pts)
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    textColor="#E65100"
                    onPress={() => injectTestEvent('harsh_accel')}
                    style={styles.maneuverBtn}
                  >
                    Acelerada (-5pts)
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    textColor="#1565C0"
                    onPress={() => injectTestEvent('sharp_turn')}
                    style={styles.maneuverBtn}
                  >
                    Curva (-3pts)
                  </Button>
                </View>
              </View>

              <Button
                mode="contained"
                buttonColor="#D32F2F"
                textColor="#FFFFFF"
                onPress={endCurrentTrip}
                style={styles.actionButton}
                icon="flag-checkered"
              >
                Terminar y Guardar Viaje
              </Button>
            </View>
          ) : detectorState === 'starting' ? (
            /* Starting Countdown Banner */
            <View style={styles.stateNotice}>
              <Text variant="bodyMedium" style={styles.noticeText}>
                🚗 Se detectó velocidad de marcha (superior a 15 km/h).
                Confirmando inicio del viaje en {countdown} segundos...
              </Text>
              <Button
                mode="contained"
                onPress={startManualTrip}
                style={styles.actionButton}
              >
                Confirmar Inicio Ahora
              </Button>
            </View>
          ) : detectorState === 'ending' ? (
            /* Ending Countdown Banner */
            <View style={styles.stateNotice}>
              <Text variant="bodyMedium" style={styles.noticeText}>
                🛑 Vehículo detenido (inferior a 5 km/h). El viaje se guardará
                en {countdown} segundos si no se reanuda la marcha.
              </Text>
              <Button
                mode="contained"
                buttonColor="#D32F2F"
                onPress={endCurrentTrip}
                style={styles.actionButton}
              >
                Finalizar Inmediatamente
              </Button>
            </View>
          ) : (
            /* Idle State */
            <View style={styles.idleContainer}>
              <Text variant="bodyMedium" style={styles.infoText}>
                La detección automática iniciará cuando comiences a conducir
                (más de 15 km/h por 10 segundos continuos).
              </Text>
              <Button
                mode="contained"
                onPress={startManualTrip}
                style={styles.actionButton}
                icon="car"
              >
                Iniciar Viaje Manualmente
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Test & Simulation Tools */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionHeaderTitle}>
            Simulador de Pruebas
          </Text>
          <Text variant="bodySmall" style={styles.simulationDesc}>
            Ejecuta un ciclo de conducción continuo para probar la detección,
            acumulación de km y scoring:
          </Text>

          {/* Active Simulation Status */}
          {simulationSpeed !== null && (
            <View style={styles.simActiveBadge}>
              <Text variant="labelMedium" style={styles.simActiveText}>
                ⚡ SIMULACIÓN ACTIVA: {simulationSpeed} km/h (actualizando cada 1s)
              </Text>
            </View>
          )}

          <View style={styles.simulationButtons}>
            <Button
              mode={simulationSpeed === 35 ? 'contained' : 'outlined'}
              compact
              onPress={() => startSimulation(35)}
              style={styles.simBtn}
              icon="speedometer"
            >
              35 km/h
            </Button>
            <Button
              mode={simulationSpeed === 90 ? 'contained' : 'outlined'}
              compact
              onPress={() => startSimulation(90)}
              style={styles.simBtn}
              icon="car-sports"
            >
              90 km/h
            </Button>
            <Button
              mode={simulationSpeed === 0 ? 'contained' : 'outlined'}
              compact
              onPress={() => startSimulation(0)}
              style={styles.simBtn}
              icon="car-brake-hold"
            >
              0 km/h
            </Button>
          </View>

          {simulationSpeed !== null && (
            <Button
              mode="outlined"
              textColor="#D32F2F"
              compact
              onPress={stopSimulation}
              style={styles.stopSimBtn}
              icon="stop-circle"
            >
              Detener Simulación
            </Button>
          )}

          <Divider style={styles.divider} />

          {/* Sensor Diagnostics Toggle */}
          <View style={styles.sensorToggleRow}>
            <Button
              mode="outlined"
              compact
              icon={showDiagnostics ? 'eye-off' : 'tune'}
              onPress={() => setShowDiagnostics(!showDiagnostics)}
              style={styles.sensorToggleBtn}
            >
              {showDiagnostics ? 'Ocultar Sensores' : 'Ver Sensores en Vivo'}
            </Button>
          </View>

          {showDiagnostics && (
            <View style={styles.diagnosticsContainer}>
              <Text variant="labelMedium" style={styles.diagTitle}>
                Sensores del Dispositivo (Mueve o inclina tu teléfono):
              </Text>
              <View style={styles.sensorGrid}>
                <View style={styles.sensorCard}>
                  <Text variant="labelSmall" style={styles.sensorCardTitle}>
                    ACELERÓMETRO
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    X: {accelerometer ? accelerometer.x.toFixed(2) : '0.00'}
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    Y: {accelerometer ? accelerometer.y.toFixed(2) : '0.00'}
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    Z: {accelerometer ? accelerometer.z.toFixed(2) : '0.00'}
                  </Text>
                </View>
                <View style={styles.sensorCard}>
                  <Text variant="labelSmall" style={styles.sensorCardTitle}>
                    GIROSCOPIO
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    X: {gyroscope ? gyroscope.x.toFixed(2) : '0.00'}
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    Y: {gyroscope ? gyroscope.y.toFixed(2) : '0.00'}
                  </Text>
                  <Text variant="bodySmall" style={styles.diagText}>
                    Z: {gyroscope ? gyroscope.z.toFixed(2) : '0.00'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Score & Cumulative Stats */}
      <Card style={styles.card}>
        <Card.Title title="Tu Nivel de Conducción" />
        <Card.Content>
          <ScoreGauge
            score={user?.stats?.averageScore ?? 100}
            size={160}
            subtitle="Calificación Global"
          />

          <Divider style={styles.scoreDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statBigText}>
                {user?.stats?.totalTrips || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabelText}>
                Viajes
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statBigText}>
                {user?.stats?.totalDistance?.toFixed(1) || '0.0'}
              </Text>
              <Text variant="bodySmall" style={styles.statLabelText}>
                Kilómetros
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statBigText}>
                {user?.stats?.averageScore?.toFixed(0) || '100'}
              </Text>
              <Text variant="bodySmall" style={styles.statLabelText}>
                Promedio
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Evolution / Trend Chart */}
      <Card style={styles.card}>
        <Card.Content>
          <TrendChart
            data={trendScores}
            labels={trendLabels}
            title="Evolución de Puntajes"
          />
        </Card.Content>
      </Card>

      {/* Latest Trip Preview */}
      {latestTrip && (
        <View style={styles.latestTripSection}>
          <Text variant="titleMedium" style={styles.sectionHeaderTitleMargin}>
            Último Viaje Registrado
          </Text>
          <TripCard
            trip={latestTrip}
            onPress={() => router.push(`/trip/${latestTrip.id}`)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subtitle: {
    color: '#666666',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  chip: {
    height: 32,
  },
  chipActive: {
    backgroundColor: '#E8F5E9',
  },
  chipWarning: {
    backgroundColor: '#FFF3E0',
  },
  chipIdle: {
    backgroundColor: '#E3F2FD',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  activeContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  speedometer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  speedValue: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  speedUnit: {
    color: '#888888',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontWeight: 'bold',
  },
  metricLabel: {
    color: '#666666',
    marginTop: 2,
  },
  eventBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  eventChip: {
    backgroundColor: '#FFEBEE',
  },
  maneuverContainer: {
    width: '100%',
    backgroundColor: '#F7F8FA',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  maneuverTitle: {
    color: '#78909C',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  maneuverButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  maneuverBtn: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  stateNotice: {
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginVertical: 8,
  },
  noticeText: {
    color: '#855E00',
    lineHeight: 20,
    marginBottom: 10,
  },
  idleContainer: {
    paddingVertical: 8,
  },
  infoText: {
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  sectionHeaderTitle: {
    fontWeight: '600',
  },
  simulationDesc: {
    color: '#777777',
    marginVertical: 8,
  },
  simActiveBadge: {
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  simActiveText: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 11,
  },
  simulationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  simBtn: {
    flex: 1,
    marginHorizontal: 3,
  },
  stopSimBtn: {
    marginTop: 8,
    borderColor: '#D32F2F',
  },
  sensorToggleRow: {
    marginTop: 4,
    alignItems: 'flex-start',
  },
  sensorToggleBtn: {
    borderRadius: 8,
  },
  diagnosticsContainer: {
    marginTop: 10,
  },
  divider: {
    marginVertical: 12,
  },
  diagTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  sensorGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8EAEF',
  },
  sensorCardTitle: {
    color: '#666666',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  diagText: {
    color: '#333333',
    fontFamily: 'monospace',
    marginBottom: 2,
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  scoreDivider: {
    marginVertical: 14,
  },
  statBigText: {
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  statLabelText: {
    color: '#666666',
    marginTop: 2,
  },
  latestTripSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeaderTitleMargin: {
    fontWeight: '600',
    marginBottom: 10,
    color: '#212121',
  },
});
