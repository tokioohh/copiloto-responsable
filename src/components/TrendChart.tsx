import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface TrendChartProps {
  data: number[];
  labels: string[];
  title?: string;
}

export default function TrendChart({ data, labels, title }: TrendChartProps) {
  const screenWidth = Dimensions.get('window').width;

  // TODO Sprint 4: Implement complete chart configuration
  // For now, just show placeholder

  return (
    <View style={styles.container}>
      {title && (
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
      )}
      <View style={styles.placeholder}>
        <Text variant="bodyMedium" style={styles.placeholderText}>
          Sprint 4: Gráfica de tendencias
        </Text>
        <Text variant="bodySmall" style={styles.placeholderSubtext}>
          {data.length} puntos de datos
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  placeholder: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
  },
  placeholderSubtext: {
    color: '#999',
    marginTop: 4,
  },
});
