# Copiloto Responsable

> **📖 Primera vez aquí? → [START_HERE.md](./START_HERE.md)**

App móvil tipo "fitness tracker" para conducción. Usa sensores del smartphone para analizar la calidad de manejo del usuario y calcular un puntaje de conducción.

**Estado**: ✅ Sprint 1 completado - Autenticación y navegación funcionales

## Stack Tecnológico

- **Frontend**: React Native + Expo (SDK 57)
- **Backend**: Firebase (Auth + Firestore + Functions)
- **State Management**: Zustand
- **UI Library**: React Native Paper
- **Charts**: React Native Chart Kit

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Firebase Authentication (Email/Password)
3. Crear una base de datos Firestore
4. Copiar las credenciales de Firebase
5. Actualizar `.env.local` con tus credenciales:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
```

### 3. Configurar Firestore

Desplegar las reglas de seguridad:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4. Ejecutar la App

```bash
# Iniciar Expo
npm start

# Para Android
npm run android

# Para iOS
npm run ios
```

## Estructura del Proyecto

```
app/                    # Expo Router screens
├── (auth)/            # Authentication screens
├── (tabs)/            # Main app tabs
└── trip/              # Trip detail screens

src/
├── components/        # Reusable UI components
├── services/          # Business logic services
├── stores/            # Zustand state management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── hooks/             # Custom React hooks
└── config/            # App configuration
```

## Estado del Desarrollo (MVP)

### ✅ Sprint 1 - Completado
- Estructura del proyecto con Expo Router
- Autenticación Firebase (login/register)
- Navegación por tabs
- Stores de estado (auth, trip, settings)
- Pantallas básicas de UI

### 🚧 Sprint 2 - Pendiente
- Servicios de sensores (acelerómetro, giroscopio)
- Tracking de GPS
- Detección automática de inicio/fin de viaje
- Permisos de background location
- Background task manager

### 🚧 Sprint 3 - Pendiente
- Fusión de sensores (sensor fusion)
- Detección de eventos de conducción
- Algoritmo de scoring
- Sincronización con Firestore
- Procesamiento post-viaje

### 🚧 Sprint 4 - Pendiente
- Dashboard con gráficas
- Score gauge circular
- Historial de viajes funcional
- Detalles de viaje con eventos
- Trends y estadísticas

## Permisos Requeridos

- **Location (Always)**: Detección automática de viajes en background
- **Motion & Fitness**: Acceso a acelerómetro y giroscopio

## Testing

Para probar la app, recomendamos usar Expo Go inicialmente y luego un development build para testing con sensores en background.

```bash
# Iniciar con Expo Go
npm start

# Crear development build
npx expo run:android
npx expo run:ios
```

## Notas de Desarrollo

- Código fuente en **inglés**
- UI strings en **español**
- No se almacenan datos raw de sensores (solo eventos procesados)
- Scoring calculado localmente, validado opcionalmente en Cloud Functions
- MVP no incluye sistema padre-hijo ni comparativas sociales

## Licencia

MIT
