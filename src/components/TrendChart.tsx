import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TrendChartProps {
  data: number[];
  labels: string[];
  title?: string;
  height?: number;
}

export default function TrendChart({
  data,
  labels,
  title = 'Evolución de Puntajes',
  height = 200,
}: TrendChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 48, 280);

  // If no data points, render an elegant empty state
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        {title ? (
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <Surface style={styles.emptyContainer} elevation={0}>
          <MaterialCommunityIcons
            name="chart-timeline-variant"
            size={36}
            color="#9E9E9E"
          />
          <Text variant="bodyMedium" style={styles.emptyText}>
            Sin viajes suficientes aún
          </Text>
          <Text variant="bodySmall" style={styles.emptySubtext}>
            Completa tus primeros viajes para ver la gráfica de evolución.
          </Text>
        </Surface>
      </View>
    );
  }

  // Handle single data point safely without bezier math crashes
  let chartDataValues = data;
  let chartLabels = labels;

  if (data.length === 1) {
    // Duplicate single point so LineChart can draw a steady baseline line
    chartDataValues = [data[0], data[0]];
    chartLabels = [labels[0] || 'V1', ''];
  } else if (data.length > 6) {
    // Keep the most recent 6 trips to avoid overcrowded labels
    chartDataValues = data.slice(-6);
    chartLabels = labels.slice(-6);
  }

  // Compute quick summary stats
  const average = Math.round(
    data.reduce((acc, curr) => acc + curr, 0) / data.length
  );
  const latest = data[data.length - 1];

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#1565C0',
      fill: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '4',
      stroke: '#F0F0F0',
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text variant="titleMedium" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Últimos {data.length} viajes registrados
          </Text>
        </View>

        <Chip
          compact
          mode="flat"
          style={styles.summaryChip}
          textStyle={styles.summaryChipText}
        >
          Último: {latest} pts
        </Chip>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: chartLabels,
            datasets: [
              {
                data: chartDataValues,
                color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
                strokeWidth: 3,
              },
            ],
          }}
          width={chartWidth}
          height={height}
          yAxisInterval={1}
          fromZero={true}
          segments={4}
          bezier={chartDataValues.length > 2}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontWeight: 'bold',
    color: '#212121',
  },
  subtitle: {
    color: '#757575',
    marginTop: 2,
  },
  summaryChip: {
    backgroundColor: '#E3F2FD',
    height: 28,
  },
  summaryChipText: {
    color: '#1565C0',
    fontSize: 11,
    fontWeight: 'bold',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
    marginVertical: 4,
  },
  emptyContainer: {
    height: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAEF',
    borderStyle: 'dashed',
    padding: 16,
  },
  emptyText: {
    color: '#424242',
    fontWeight: '600',
    marginTop: 8,
  },
  emptySubtext: {
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
});

