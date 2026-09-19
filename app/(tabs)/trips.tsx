import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useTripStore } from '../../src/stores/tripStore';
import TripCard from '../../src/components/TripCard';

export default function TripsScreen() {
  const user = useAuthStore((state) => state.user);
  const { trips, loading, loadTrips } = useTripStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      loadTrips(user.uid);
    }
  }, [user?.uid]);

  const onRefresh = async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    try {
      await loadTrips(user.uid);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && trips.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Cargando historial de viajes...
        </Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialCommunityIcons
          name="car-off"
          size={56}
          color="#BDBDBD"
          style={styles.emptyIcon}
        />
        <Text variant="titleMedium" style={styles.emptyText}>
          No hay viajes registrados
        </Text>
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Cuando comiences a conducir o ejecutes una simulación, tus viajes aparecerán aquí.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#1E88E5']}
          tintColor="#1E88E5"
        />
      }
      renderItem={({ item }) => (
        <TripCard
          trip={item}
          onPress={() => router.push(`/trip/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  emptySubtext: {
    color: '#777777',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    padding: 16,
    backgroundColor: '#F5F5F7',
    minHeight: '100%',
  },
});
