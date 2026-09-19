import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Switch, Button, Divider, TextInput } from 'react-native-paper';
import { useAuthStore } from '../../src/stores/authStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();

  const {
    notifications,
    autoDetection,
    speedLimit,
    loadSettings,
    updateSettings,
  } = useSettingsStore();

  const [localSpeedLimit, setLocalSpeedLimit] = useState(speedLimit.toString());

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleSpeedLimitChange = () => {
    const newLimit = parseInt(localSpeedLimit);
    if (!isNaN(newLimit) && newLimit > 0 && newLimit <= 200) {
      updateSettings({ speedLimit: newLimit });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">{user?.displayName}</Text>
          <Text variant="bodyMedium" style={styles.email}>
            {user?.email}
          </Text>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Title title="Configuración" />
        <Card.Content>
          <List.Item
            title="Notificaciones"
            description="Recibir alertas sobre viajes y logros"
            right={() => (
              <Switch
                value={notifications}
                onValueChange={(value) => updateSettings({ notifications: value })}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Detección Automática"
            description="Iniciar viajes automáticamente al conducir"
            right={() => (
              <Switch
                value={autoDetection}
                onValueChange={(value) => updateSettings({ autoDetection: value })}
              />
            )}
          />
          <Divider />
          <View style={styles.speedLimitContainer}>
            <View style={styles.speedLimitHeader}>
              <Text variant="titleMedium">Límite de Velocidad</Text>
              <Text variant="bodySmall" style={styles.speedLimitDesc}>
                Umbral para detectar exceso de velocidad (km/h)
              </Text>
            </View>
            <View style={styles.speedLimitInput}>
              <TextInput
                value={localSpeedLimit}
                onChangeText={setLocalSpeedLimit}
                onBlur={handleSpeedLimitChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <Text variant="bodyLarge" style={styles.kmh}>
                km/h
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Stats Summary */}
      <Card style={styles.card}>
        <Card.Title title="Estadísticas" />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">{user?.stats.totalTrips || 0}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Viajes Totales
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">
                {user?.stats.totalDistance.toFixed(0) || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Kilómetros
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">
                {user?.stats.averageScore.toFixed(0) || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Puntaje Promedio
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">
                {Math.floor((user?.stats.totalDuration || 0) / 60)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Horas Conducidas
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Sign Out */}
      <Button
        mode="outlined"
        onPress={handleSignOut}
        style={styles.signOutButton}
        textColor="#F44336"
      >
        Cerrar Sesión
      </Button>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.version}>
          Versión 1.0.0 (MVP)
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
  },
  email: {
    color: '#666',
    marginTop: 4,
  },
  speedLimitContainer: {
    paddingVertical: 16,
  },
  speedLimitHeader: {
    marginBottom: 12,
  },
  speedLimitDesc: {
    color: '#666',
    marginTop: 4,
  },
  speedLimitInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 100,
    marginRight: 12,
  },
  kmh: {
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 24,
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  signOutButton: {
    margin: 16,
    borderColor: '#F44336',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    color: '#999',
  },
});
