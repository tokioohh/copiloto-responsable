# Guía de Configuración - Copiloto Responsable

## Configuración Firebase

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto"
3. Nombre: `copiloto-responsable` (o el que prefieras)
4. Desactiva Google Analytics (opcional para MVP)
5. Clic en "Crear proyecto"

### 2. Configurar Authentication

1. En el menú lateral: **Build > Authentication**
2. Clic en "Comenzar"
3. Habilita el proveedor **Email/Password**
4. Guarda

### 3. Configurar Firestore

1. En el menú lateral: **Build > Firestore Database**
2. Clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de producción"
4. Elige una ubicación cercana (ej: `southamerica-east1`)
5. Clic en "Habilitar"

### 4. Obtener Credenciales

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. Scroll hasta "Tus apps"
3. Clic en el ícono **Web** (`</>`)
4. Registra la app: `copiloto-responsable-web`
5. **Copia todas las credenciales** que aparecen en `firebaseConfig`

### 5. Configurar Variables de Entorno

Actualiza el archivo `.env.local` con las credenciales:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 6. Instalar Firebase CLI (Opcional pero Recomendado)

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

Selecciona:
- ✅ Firestore: Configure security rules and indexes files
- Usa archivos existentes: `firestore.rules` y `firestore.indexes.json`

### 7. Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Verificar Configuración

### Test de Autenticación

1. Ejecuta `npm start`
2. Abre la app en Expo Go
3. Intenta registrarte con un email y contraseña
4. Verifica en Firebase Console > Authentication que el usuario se creó
5. Verifica en Firestore que se creó el documento en `users/{uid}`

### Test de Permisos

Si ves errores de "Missing or insufficient permissions":
- Verifica que las reglas de Firestore estén desplegadas
- Revisa en Firebase Console > Firestore > Reglas
- Deben mostrar el contenido de `firestore.rules`

## Troubleshooting

### Error: "Firebase app already exists"
- Reinicia Metro bundler: `npx expo start --clear`

### Error: "CORS policy" en web
- Normal en desarrollo web con Firebase
- Usa Android/iOS para testing de Firebase

### Error: "API key not valid"
- Verifica que las variables en `.env.local` estén correctas
- Verifica que el proyecto Firebase esté activo
- Revisa las restricciones de API key en Google Cloud Console

### Permisos de Location no funcionan
- En desarrollo: asegúrate de aprobar permisos en el dispositivo
- Para background location en iOS: necesitas desarrollo build, no funciona en Expo Go
- Para Android: necesitas declarar `ACCESS_BACKGROUND_LOCATION` (ya está en app.json)

## Verificación de Conexión

Una vez configurado Firebase:

1. Inicia la app con `npm start`
2. Regístrate con un nuevo usuario desde la pantalla de registro
3. Verifica en Firebase Console que el usuario aparece en Authentication y en la colección `users` de Firestore
4. Inicia un viaje de prueba y verifica la sincronización de documentos en la colección `trips`

## Testing sin Firebase

Si no quieres configurar Firebase aún:
- Comenta la línea `initializeAuth()` en `app/_layout.tsx`
- La app abrirá pero todas las features de auth/datos fallarán
- Solo puedes ver la estructura de UI
