import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface MetricRowProps {
  label: string;
  value: string | number;
  icon?: string;
}

export default function MetricRow({ label, value, icon }: MetricRowProps) {
  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
      <Text variant="titleMedium" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: 'bold',
  },
});
