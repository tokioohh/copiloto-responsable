# Copiloto Responsable - Agent Handoff

> App móvil tipo "fitness tracker" para conducción. Analiza calidad de manejo usando sensores del smartphone y calcula puntaje 0-100 por viaje.

---

## Estado Actual: Sprint 1 Completado ✅

**Fecha**: 2026-09-18  
**Version**: 1.0.0 MVP  
**Expo SDK**: 57 (latest stable)

### Lo que funciona:
- ✅ Autenticación completa (Firebase Auth)
- ✅ Navegación con Expo Router
- ✅ CRUD de usuarios en Firestore
- ✅ Settings locales con AsyncStorage
- ✅ UI completa (todas las pantallas)

### Lo que falta (Sprints 2-4):
- 🚧 Sensores y GPS (Sprint 2)
- 🚧 Trip detection automático (Sprint 2)
- 🚧 Scoring y eventos (Sprint 3)
- 🚧 Gráficas con datos reales (Sprint 4)

---

## Stack Tecnológico

```
Frontend: React Native + Expo 57
Routing: Expo Router (file-based)
Backend: Firebase (Auth + Firestore)
State: Zustand
UI: React Native Paper
Charts: react-native-chart-kit
```

**Importante**: Usamos Firebase **JS SDK** (NO `@react-native-firebase`) para compatibilidad con Expo Go.

---

## Arquitectura del Proyecto

```
app/                    # Screens (Expo Router)
  (auth)/              # Login/Register - protegidas
  (tabs)/              # Home, Trips, Profile - requieren auth
  trip/[id].tsx        # Dynamic route - detalle de viaje

src/
  stores/              # Zustand state management
    authStore.ts       # ✅ COMPLETO - auth con Firebase
    tripStore.ts       # 🚧 Estructura, TODOs Sprint 3
    settingsStore.ts   # ✅ COMPLETO - settings locales
    
  services/            # Business logic
    sensorService.ts   # 🚧 TODO Sprint 2 - acelerómetro/giroscopio
    locationService.ts # 🚧 TODO Sprint 2 - GPS tracking
    tripDetector.ts    # 🚧 TODO Sprint 2 - auto start/stop
    tripProcessor.ts   # 🚧 TODO Sprint 3 - scoring pipeline
    firebaseService.ts # 🚧 TODO Sprint 3 - Firestore CRUD
    
  utils/
    sensorFusion.ts    # 🚧 TODO Sprint 3 - event detection
    scoring.ts         # 🚧 TODO Sprint 3 - score calculation
    constants.ts       # ✅ Thresholds y config
    
  types/               # ✅ COMPLETO - TypeScript interfaces
  components/          # ✅ COMPLETO - UI components base
  config/
    firebase.ts        # ✅ Firebase SDK init
```

---

## Decisiones de Arquitectura Clave

### 1. Firebase JS SDK (no Native)
**Por qué**: Expo Go compatible, no requiere development build para Sprint 1.  
**Trade-off**: Limitaciones en background tasks (se resuelve en Sprint 2 con dev build).

### 2. No Storage de Datos Raw
**Por qué**: Minimizar costos de Firestore y storage.  
**Cómo**: Procesamos sensores en tiempo real, solo guardamos eventos detectados.

### 3. Scoring Post-Viaje
**Por qué**: Ahorro de batería, menos distracción al conducir.  
**Cómo**: Se calcula localmente al finalizar viaje, se sube a Firestore.

### 4. Expo Router (no React Navigation)
**Por qué**: File-based routing más simple, menos boilerplate.  
**Estructura**: `(auth)` y `(tabs)` groups para rutas protegidas.

### 5. Adaptive Sampling
**Estrategia**: 5Hz durante eventos, 2Hz en calma (después de 60s sin eventos).  
**Implementación**: Sprint 2 en `sensorService.ts`.

---

## Flujo de Datos

### Durante el Viaje (Sprint 2-3)
```
GPS detecta movimiento (>15km/h por 10s)
  ↓
tripDetector.onTripStart() → tripStore.startTrip()
  ↓
Background task inicia sensores + GPS
  ↓
Cada 200ms: accel/gyro → sensorFusion.detectEvents()
Cada 1s: GPS → routeBuffer
  ↓
Eventos detectados → eventBuffer (local)
  ↓
GPS detecta parada (<5km/h por 60s)
  ↓
tripDetector.onTripEnd() → tripStore.endTrip()
```

### Post-Viaje (Sprint 3)
```
tripProcessor.finalizeTrip(activeTrip)
  ↓
calculateMetrics(eventBuffer + routeBuffer)
  ↓
calculateTripScore(metrics)
  ↓
firebaseService.uploadTrip(trip)
  ↓
updateUserStats(userId)
  ↓
Clear local buffers
```

---

## Modelo de Datos (Firestore)

### Collection: `users`
```typescript
{
  uid: string
  email: string
  displayName?: string
  settings: { notifications, autoDetection, speedLimit }
  stats: { totalTrips, averageScore, totalDistance, totalDuration }
}
```

### Collection: `trips`
```typescript
{
  id: string
  userId: string
  startTime: Timestamp
  endTime: Timestamp
  distance: number        // km
  duration: number        // seconds
  dismissed: boolean      // "No soy conductor"
  route: RoutePoint[]     // GPS points with timestamp/speed
  events: DrivingEvent[]  // harsh_brake, harsh_accel, sharp_turn, speeding
  metrics: {
    harshBrakes, harshAccels, sharpTurns,
    speedingDuration, averageSpeed, maxSpeed
  }
  score: {
    total: 0-100
    breakdown: { braking, acceleration, speed, turning, phoneUsage }
  }
}
```

---

## Configuración Requerida

### Firebase Setup
1. Crear proyecto en Firebase Console
2. Habilitar Auth (Email/Password)
3. Crear Firestore database
4. Copiar credenciales a `.env.local`
5. Deploy rules: `firebase deploy --only firestore:rules`

Ver **`SETUP.md`** para guía paso a paso.

### Variables de Entorno
```bash
# .env.local
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

---

## Testing

### Sprint 1 (funciona ahora con Expo Go)
```bash
npm start
# Escanear QR con Expo Go
# Probar: register → login → navegación → settings
```

### Sprint 2+ (requiere development build)
```bash
# Background location no funciona en Expo Go
npx expo run:android
npx expo run:ios
```

### Verificación TypeScript
```bash
npx tsc --noEmit  # Debe pasar sin errores
```

---

## Roadmap (12 semanas totales)

### Sprint 2: Sensors + Detection (2 semanas) 🔜
**Prioridad alta**: Implementar servicios de sensores.

```typescript
// src/services/sensorService.ts
startAccelerometer(callback) // Expo.Accelerometer
startGyroscope(callback)     // Expo.Gyroscope
setSamplingRate(200)         // Adaptive: 200ms → 500ms

// src/services/locationService.ts
startTracking(callback)      // Location.watchPositionAsync
requestPermissions()         // Background location

// src/services/tripDetector.ts
processLocation(location)    // State machine: idle → active → idle
// Triggers: onTripStart, onTripEnd
```

**Archivos a modificar**:
- `src/services/{sensor,location,tripDetector}Service.ts`
- `src/stores/tripStore.ts` (integrar detección)
- `app/(tabs)/index.tsx` (UI de viaje activo)

**Testing**: Dispositivo real con GPS + movimiento en auto.

---

### Sprint 3: Processing + Scoring (2 semanas)
**Prioridad alta**: Implementar algoritmos de fusión y scoring.

```typescript
// src/utils/sensorFusion.ts
detectHarshBraking(accel, gyro, location)
// 4-signal validation: accel magnitude + GPS speed + gyro stable + direction

// src/utils/scoring.ts
calculateTripScore(metrics)
// braking(30) + accel(25) + speed(20) + turning(15) + phone(10) = 100

// src/services/firebaseService.ts
uploadTrip(trip)
loadUserTrips(userId, limit)
```

**Testing**: Mock de eventos, verificar scores esperados.

---

### Sprint 4: UI + Visualization (2 semanas)
**Prioridad media**: Completar dashboards y gráficas.

```typescript
// src/components/TrendChart.tsx
<LineChart data={scores} labels={dates} />

// app/(tabs)/index.tsx
- Score gauge animado con datos reales
- Weekly trend chart
- Last trip preview
```

**Testing**: Verificar renders, performance en listas largas.

---

### Sprint 5: Polish (2 semanas)
- Battery optimization audit
- False positive tuning
- Error states elegantes
- Loading states

### Sprint 6: Beta (2 semanas)
- Onboarding flow
- Internal testing 5-10 usuarios
- App store submission

---

## Troubleshooting Común

### "Firebase app already exists"
```bash
npx expo start --clear
```

### Auth no funciona
- Verificar `.env.local` tiene credenciales correctas
- Verificar Firebase Auth está habilitado en Console

### Firestore permission denied
```bash
firebase deploy --only firestore:rules
# Verificar en Firebase Console > Firestore > Rules
```

### Sensores no responden (Sprint 2+)
- Expo Go tiene limitaciones → usar development build
- Verificar permisos en device settings
- iOS background location requiere `UIBackgroundModes` en app.json (✅ ya está)

---

## Convenciones de Código

### Idiomas
- **Código**: Inglés (variables, funciones, tipos)
- **UI strings**: Español (textos visibles al usuario)
- **Comentarios**: Inglés (solo cuando el "por qué" no es obvio)

### Estructura
```typescript
// Services: Pure functions, no state
export const serviceName = {
  method1: () => {},
  method2: () => {},
}

// Stores: Zustand with actions
export const useStore = create<State>((set, get) => ({
  value: initialValue,
  action: () => set({ ... }),
}))

// Components: Functional with TypeScript
interface Props { ... }
export default function Component({ }: Props) { ... }
```

---

## Métricas de Éxito (MVP)

- ✅ Trip detection rate > 95%
- ✅ False positive events < 10% per trip
- ✅ Battery < 15% por hora de viaje
- ✅ Post-trip sync < 10 segundos
- ✅ App estable en background 24+ horas

---

## Referencias Rápidas

| Archivo | Propósito |
|---------|-----------|
| `EJECUTAR_PROYECTO.md` | 🚀 Cómo iniciar el proyecto |
| `SETUP.md` | Configuración Firebase detallada |
| `PROJECT_STATUS.md` | Roadmap completo de sprints |
| `IMPLEMENTATION_SUMMARY.md` | Resumen técnico |

### Expo v57 Docs
- [Sensors](https://docs.expo.dev/versions/v57.0.0/sdk/sensors/)
- [Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Task Manager](https://docs.expo.dev/versions/v57.0.0/sdk/task-manager/)

### External APIs
- [Firebase Auth](https://firebase.google.com/docs/auth/web/start)
- [Firestore](https://firebase.google.com/docs/firestore)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

---

## Contacto / Handoff

**Proyecto creado**: 2026-09-18  
**Contrato original**: Ver archivo raíz del proyecto  
**Estado Git**: Inicializado, sin commits aún

**Para continuar desarrollo**:
1. Lee `PROJECT_STATUS.md` para contexto completo
2. Configura Firebase con `SETUP.md`
3. Ejecuta `npm start` para verificar Sprint 1
4. Comienza Sprint 2 implementando `sensorService.ts`

**Archivos con TODOs Sprint 2-3**:
```bash
grep -r "TODO Sprint" src/
# Lista todos los TODOs pendientes
```

---

## Notas Importantes para Agentes

### Al modificar autenticación
- `authStore.ts` maneja todo el flujo de auth
- Protected routes en `app/(auth)/_layout.tsx` (auto-redirect)
- Firestore rules validan userId match

### Al implementar sensores (Sprint 2)
- Leer thresholds en `src/utils/constants.ts` PRIMERO
- Adaptive sampling es crítico para batería
- Trip detection es state machine (4 estados: idle/starting/active/ending)

### Al implementar scoring (Sprint 3)
- Fórmula exacta en `src/utils/scoring.ts` (comentarios)
- Sensor fusion requiere 4 validaciones simultáneas
- No cambiar pesos de score sin justificación documentada

### Al implementar UI (Sprint 4)
- React Native Paper theme ya configurado
- date-fns con locale `es` para español
- Chart kit necesita dimensions del screen

---

**Estado del handoff**: ✅ Proyecto listo para Sprint 2  
**Siguiente milestone**: Implementar detección automática de viajes  
**Blocker actual**: Ninguno (Firebase configuración es opcional para desarrollo)
