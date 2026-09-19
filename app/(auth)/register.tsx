import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, loading, error } = useAuthStore();
  const router = useRouter();

  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await signUp(email, password, displayName);
      router.replace('/(tabs)');
    } catch (err) {
      // Error is handled by store
    }
  };

  const errorMessage = validationError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Crear Cuenta
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Comienza tu viaje hacia una conducción más segura
        </Text>

        <TextInput
          label="Nombre"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !email || !password || !confirmPassword}
          style={styles.button}
        >
          Registrarse
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMedium">¿Ya tienes cuenta? </Text>
          <Link href="/(auth)/login" asChild>
            <Text variant="bodyMedium" style={styles.link}>
              Inicia Sesión
            </Text>
          </Link>
        </View>

        <Snackbar
          visible={!!errorMessage}
          onDismiss={() => setValidationError('')}
          duration={3000}
          style={styles.snackbar}
        >
          {errorMessage}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
  },
});
