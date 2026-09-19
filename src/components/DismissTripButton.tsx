import { Button } from 'react-native-paper';

interface DismissTripButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export default function DismissTripButton({ onPress, loading }: DismissTripButtonProps) {
  return (
    <Button
      mode="outlined"
      onPress={onPress}
      loading={loading}
      disabled={loading}
      icon="account-off"
      style={{ marginTop: 8 }}
    >
      No soy el conductor
    </Button>
  );
}
