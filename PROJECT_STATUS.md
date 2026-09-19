# Estado del Proyecto - Copiloto Responsable

**Fecha**: 2026-09-18  
**Sprint Actual**: Sprint 1 ✅ Completado

---

## ✅ Sprint 1: Setup + Auth (COMPLETADO)

### Infraestructura
- ✅ Proyecto Expo inicializado con TypeScript
- ✅ Expo Router configurado (file-based routing)
- ✅ Firebase JS SDK integrado (v12+)
- ✅ Estructura de carpetas completa
- ✅ Tipos TypeScript definidos
- ✅ Constantes de configuración
- ✅ `.env.local` de ejemplo

### Autenticación
- ✅ AuthStore con Zustand
- ✅ Login screen funcional
- ✅ Register screen funcional
- ✅ Creación de usuarios en Firestore
- ✅ Auth state persistence
- ✅ Protected routes con navegación automática

### UI Base
- ✅ Tab navigation (Home, Viajes, Perfil)
- ✅ Dashboard placeholder
- ✅ Trip history placeholder
- ✅ Profile settings screen
- ✅ Trip detail screen structure
- ✅ React Native Paper theme

### Stores
- ✅ `authStore.ts` - Autenticación completa
- ✅ `tripStore.ts` - Estructura base (TODOs)
- ✅ `settingsStore.ts` - Settings locales

### Firestore
- ✅ Security rules definidas
- ✅ Índices configurados
- ✅ Modelo de datos documentado

### Componentes
- ✅ `TripCard` - Card de viaje en lista
- ✅ `ScoreGauge` - Gauge circular de puntaje
- ✅ `MetricRow` - Fila de métrica
- ✅ `TrendChart` - Placeholder para gráfica
- ✅ `DismissTripButton` - Botón "No soy conductor"

---

## 🚧 Sprint 2: Sensors + Detection (PENDIENTE)

### Servicios a Implementar

#### `sensorService.ts`
```typescript
// TODO: Implementar
- startAccelerometer(callback) → SensorSubscription
- startGyroscope(callback) → SensorSubscription
- setSamplingRate(rateMs) → void (adaptive sampling)
- checkAvailability() → Promise<{accelerometer, gyroscope}>
```

#### `locationService.ts`
```typescript
// TODO: Implementar
- startTracking(callback) → LocationSubscription
- requestPermissions() → Promise<boolean>
- Background location tracking con expo-task-manager
```

#### `tripDetector.ts`
```typescript
// TODO: Implementar state machine
- processLocation(location) → void
- Detectar trip start: speed > 15 km/h por 10s
- Detectar trip end: speed < 5 km/h por 60s
- Callbacks: onTripStart, onTripEnd
```

### Tareas Clave
- [ ] Implementar subscripciones de sensores con adaptive sampling
- [ ] Configurar background location tracking
- [ ] State machine de detección de viaje
- [ ] Gestión de permisos (foreground + background)
- [ ] Background task para monitoreo continuo
- [ ] Tests en dispositivo real (no funciona completamente en Expo Go)

### Archivos a Modificar
- `src/services/sensorService.ts`
- `src/services/locationService.ts`
- `src/services/tripDetector.ts`
- `src/hooks/useTripTracking.ts` (crear)
- `app/(tabs)/index.tsx` (integrar trip detection)

---

## 🚧 Sprint 3: Processing + Scoring (PENDIENTE)

### Algoritmos a Implementar

#### `sensorFusion.ts`
```typescript
// TODO: Implementar 4-signal validation
- detectHarshBraking(accel, gyro, location) → EventDetectionResult
- detectHarshAcceleration(accel, gyro, location) → EventDetectionResult
- detectSharpTurn(gyro, location) → EventDetectionResult
- detectSpeeding(location, speedLimit) → EventDetectionResult
```

#### `scoring.ts`
```typescript
// TODO: Implementar scoring formula
- calculateTripScore(metrics) → TripScore
- Fórmula completa con pesos y clamps
```

#### `tripProcessor.ts`
```typescript
// TODO: Implementar pipeline
- processSensorData(activeTrip, accel, gyro, location) → ActiveTrip
- finalizeTrip(activeTrip, userId) → Trip
- calculateMetrics(activeTrip) → TripMetrics
```

#### `firebaseService.ts`
```typescript
// TODO: Implementar CRUD
- uploadTrip(trip) → Promise<void>
- loadUserTrips(userId, limit) → Promise<Trip[]>
- dismissTrip(tripId) → Promise<void>
- updateUserStats(userId, stats) → Promise<void>
```

### Tareas Clave
- [ ] Implementar sensor fusion con multi-signal validation
- [ ] Algoritmo de scoring completo
- [ ] Pipeline de procesamiento en tiempo real
- [ ] Buffer management para eventos y ruta
- [ ] Cálculo de métricas post-viaje
- [ ] Sync de viajes a Firestore
- [ ] Actualización de stats de usuario
- [ ] Tests de precisión (false positives < 10%)

### Archivos a Modificar
- `src/utils/sensorFusion.ts`
- `src/utils/scoring.ts`
- `src/services/tripProcessor.ts`
- `src/services/firebaseService.ts`
- `src/stores/tripStore.ts` (integrar servicios)

---

## 🚧 Sprint 4: UI + Visualization (PENDIENTE)

### Componentes a Completar

#### Dashboard
- [ ] Score gauge funcional con datos reales
- [ ] Trend chart con react-native-chart-kit
- [ ] Stats cards con datos de Firebase
- [ ] Weekly summary con cálculos reales

#### Trip History
- [ ] Integrar con `firebaseService.loadUserTrips`
- [ ] Paginación / infinite scroll
- [ ] Pull to refresh
- [ ] Filtros (fecha, dismissed)

#### Trip Detail
- [ ] Score breakdown con barras
- [ ] Event timeline con íconos
- [ ] Route map (opcional MVP, considerar react-native-maps)
- [ ] Botón "Dismiss trip" funcional

#### Components
- [ ] `TrendChart.tsx` - Implementar LineChart de chart-kit
- [ ] `ScoreGauge.tsx` - Animación de puntaje (opcional)
- [ ] `EventTimeline.tsx` (nuevo) - Timeline de eventos

### Tareas Clave
- [ ] Integrar chart-kit con datos reales
- [ ] Animaciones de score gauge
- [ ] Loading states elegantes
- [ ] Error handling en UI
- [ ] Empty states
- [ ] Optimización de renders
- [ ] Testing en iOS y Android

---

## 🚧 Sprint 5: Polish + Testing (PENDIENTE)

### Optimizaciones
- [ ] Battery optimization audit
- [ ] Memory leak checks
- [ ] Background task reliability
- [ ] Firestore query optimization
- [ ] Threshold tuning basado en datos reales

### Testing
- [ ] Testing en dispositivos reales (varios modelos)
- [ ] Calibración de sensores
- [ ] False positive reduction
- [ ] Edge cases (túneles, estacionamientos, tráfico)
- [ ] Multi-day testing

### Cloud Functions (Opcional para MVP)
- [ ] Scaffold `functions/` directory
- [ ] Function para recalcular score server-side
- [ ] Function para agregar stats periódicamente
- [ ] Deploy instructions

---

## 🚧 Sprint 6: Beta + Launch (PENDIENTE)

### Pre-Launch
- [ ] Onboarding flow
- [ ] Terms & Privacy policy
- [ ] App store assets (icon, screenshots, descripción)
- [ ] Development build para beta testers
- [ ] Internal testing con 5-10 usuarios
- [ ] Ajustes basados en feedback

### Launch
- [ ] Submit a App Store (iOS)
- [ ] Submit a Play Store (Android)
- [ ] Monitoring setup (crashes, analytics)
- [ ] User support channel

---

## Decisiones de Diseño Clave

### ✅ Implementadas
1. **Firebase JS SDK** en lugar de `@react-native-firebase` → Compatible con Expo Go
2. **No almacenar datos raw** de sensores → Solo eventos procesados
3. **Scoring post-viaje** → No en tiempo real para ahorrar batería
4. **Umbrales estáticos** de velocidad → Sin API externa de límites
5. **Expo Router** para navegación → File-based, más simple que React Navigation

### 🚧 Por Validar en Testing
1. Thresholds de detección de eventos (pueden necesitar ajuste)
2. Duración de trip start/end (10s / 60s)
3. Adaptive sampling (5Hz → 2Hz después de 60s sin eventos)
4. Battery consumption target (< 15% por hora de viaje)

---

## Próximos Pasos Inmediatos

1. **Configurar Firebase** siguiendo `SETUP.md`
2. **Testear auth flow** - registrar usuario, login, logout
3. **Comenzar Sprint 2** - Implementar `sensorService` y `locationService`
4. **Testing en dispositivo real** - Los sensores no funcionan bien en simulador

---

## Recursos

- [Expo Sensors Docs](https://docs.expo.dev/versions/latest/sdk/sensors/)
- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [Firebase JS SDK Docs](https://firebase.google.com/docs/web/setup)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Contacto**: Para dudas sobre la implementación, revisar el contrato original o los comentarios TODO en el código.
