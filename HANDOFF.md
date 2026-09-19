# 🤝 Project Handoff - Copiloto Responsable

> Guía práctica para quien tome este proyecto

---

## TL;DR - Start Here

```bash
# 1. Entender el proyecto
cat AGENTS.md              # Arquitectura y decisiones
cat PROJECT_STATUS.md      # Roadmap y sprints

# 2. Ejecutar
cat EJECUTAR_PROYECTO.md   # Instrucciones de inicio
npm start                  # Debería funcionar sin Firebase

# 3. Configurar (opcional pero recomendado)
cat SETUP.md               # Guía Firebase
# Actualizar .env.local con tus credenciales

# 4. Verificar
npx tsc --noEmit          # TypeScript OK
npm start                 # App corre
```

---

## 📋 Checklist de Handoff

### Antes de Empezar
- [ ] Leer `AGENTS.md` completo (10 min)
- [ ] Leer `PROJECT_STATUS.md` - Sprint 1 sección (5 min)
- [ ] Ejecutar `npm start` y explorar la app (5 min)
- [ ] Leer el contrato original (si está disponible) (15 min)

### Configuración Inicial
- [ ] Crear proyecto Firebase (si no tienes uno)
- [ ] Actualizar `.env.local` con credenciales
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Probar registro de usuario en la app
- [ ] Verificar usuario aparece en Firebase Console

### Entendimiento del Código
- [ ] Explorar estructura `app/` - screens con Expo Router
- [ ] Leer `src/stores/authStore.ts` - ejemplo de store completo
- [ ] Leer `src/types/*.ts` - entender modelo de datos
- [ ] Revisar `src/utils/constants.ts` - thresholds importantes

---

## 🎯 Estado Actual del Proyecto

### ✅ Lo que está LISTO
1. **Autenticación Firebase** - Producción ready
   - Login/Register funcionan
   - Protected routes configuradas
   - Persistencia de sesión
   - Firestore rules desplegadas

2. **Navegación** - Completa
   - Expo Router configurado
   - 3 tabs principales
   - Dynamic route para trip details
   - Auth redirects automáticos

3. **UI Base** - Todas las pantallas
   - Dashboard con placeholders
   - Trip history structure
   - Profile settings completo
   - Trip detail structure
   - 5 componentes reutilizables

4. **Types & Constants** - 100%
   - Todos los tipos TypeScript definidos
   - Thresholds documentados
   - Interfaces match contrato

### 🚧 Lo que FALTA (en orden)

#### Sprint 2 (SIGUIENTE) - Sensores
**Archivos a implementar**:
```
src/services/sensorService.ts       - Acelerómetro + Giroscopio
src/services/locationService.ts     - GPS tracking
src/services/tripDetector.ts        - State machine de detección
```

**Complejidad**: Media  
**Tiempo estimado**: 2 semanas  
**Dependencias**: Ninguna, puede empezar YA

**Output esperado**:
- Sensores leyendo datos cada 200ms
- GPS tracking en background
- Auto-detección de inicio/fin de viaje
- Callbacks funcionando: onTripStart, onTripEnd

#### Sprint 3 - Scoring
**Archivos a implementar**:
```
src/utils/sensorFusion.ts           - Event detection (4 signals)
src/utils/scoring.ts                - Score calculation
src/services/tripProcessor.ts       - Processing pipeline
src/services/firebaseService.ts     - CRUD completo
```

**Complejidad**: Alta  
**Tiempo estimado**: 2 semanas  
**Dependencias**: Sprint 2 terminado

#### Sprint 4 - Gráficas
**Archivos a completar**:
```
src/components/TrendChart.tsx       - Chart kit integration
app/(tabs)/index.tsx                - Dashboard con datos reales
app/(tabs)/trips.tsx                - Integrar Firestore
```

**Complejidad**: Baja  
**Tiempo estimado**: 2 semanas  
**Dependencias**: Sprint 3 terminado

---

## 🗺️ Navegando el Código

### "¿Dónde está...?"

| Necesito | Archivo |
|----------|---------|
| Login screen | `app/(auth)/login.tsx` |
| Home dashboard | `app/(tabs)/index.tsx` |
| Trip list | `app/(tabs)/trips.tsx` |
| Profile/settings | `app/(tabs)/profile.tsx` |
| Trip detail | `app/trip/[id].tsx` |
| Auth logic | `src/stores/authStore.ts` |
| Trip state | `src/stores/tripStore.ts` |
| Firebase config | `src/config/firebase.ts` |
| Types | `src/types/*.ts` |
| Thresholds | `src/utils/constants.ts` |

### "¿Cómo funciona...?"

**Autenticación**:
```typescript
// app/(auth)/_layout.tsx
// Escucha cambios en authStore.user
// Si user && inAuthGroup → redirect a /(tabs)
// Si !user && !inAuthGroup → redirect a /(auth)/login

// src/stores/authStore.ts
// initializeAuth() → onAuthStateChanged listener
// signUp/signIn → crea/obtiene usuario
// Crea documento en Firestore collection 'users'
```

**Protected Routes**:
```typescript
// El layout (auth)/_layout.tsx hace el trabajo
// useEffect escucha user y segments
// Redirecciona automáticamente según auth state
```

**Navigation**:
```typescript
// Expo Router - file-based
// app/(tabs)/index.tsx → Tab "Inicio"
// app/(tabs)/trips.tsx → Tab "Viajes"  
// app/trip/[id].tsx → /trip/abc123
// router.push('/trip/123') para navegar
```

---

## 🔧 Cómo Implementar Sprint 2

### Paso 1: Sensores (src/services/sensorService.ts)

```typescript
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { SAMPLING_RATES } from '../utils/constants';

export const sensorService = {
  startAccelerometer: (callback) => {
    Accelerometer.setUpdateInterval(SAMPLING_RATES.ACCELEROMETER);
    
    const subscription = Accelerometer.addListener((data) => {
      callback({
        x: data.x,
        y: data.y,
        z: data.z,
        timestamp: Date.now(),
      });
    });
    
    return { unsubscribe: () => subscription.remove() };
  },
  
  // Similar para gyroscope...
};
```

### Paso 2: Location (src/services/locationService.ts)

```typescript
import * as Location from 'expo-location';

export const locationService = {
  startTracking: async (callback) => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;
    
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        });
      }
    );
    
    return { unsubscribe: () => subscription.remove() };
  },
};
```

### Paso 3: Trip Detection (src/services/tripDetector.ts)

```typescript
import { TRIP_DETECTION } from '../utils/constants';

// State machine: idle → starting → active → ending → idle
// Ver comentarios TODO en el archivo para lógica completa
```

### Paso 4: Integrar en UI

```typescript
// app/(tabs)/index.tsx

import { useTripTracking } from '../../src/hooks/useTripTracking';

export default function HomeScreen() {
  const { activeTrip, startTracking, stopTracking } = useTripTracking();
  
  useEffect(() => {
    if (autoDetection) {
      startTracking(); // Inicia listeners
    }
    return () => stopTracking();
  }, [autoDetection]);
  
  // UI muestra estado de activeTrip
}
```

---

## 🐛 Problemas Conocidos

### Durante Desarrollo

1. **Expo Go y Background Location**
   - **Problema**: Background location NO funciona en Expo Go
   - **Solución**: Usar development build: `npx expo run:android`
   - **Workaround**: En Sprint 2, testear primero con foreground tracking

2. **Sensores en Simulador**
   - **Problema**: Simuladores no tienen sensores reales
   - **Solución**: Testing obligatorio en dispositivo físico
   - **Workaround**: Mock data para desarrollo de UI

3. **Firebase Persistence**
   - **Problema**: Web persistence no funciona igual que mobile
   - **Solución**: Ya configurado con `getAuth()` que usa AsyncStorage automático
   - **Status**: ✅ Resuelto

4. **TypeScript y Firebase Timestamp**
   - **Problema**: `Timestamp` tipo puede causar errores
   - **Solución**: Import de `firebase/firestore`, no usar Date directamente
   - **Ejemplo**: `Timestamp.now()`, `timestamp.toDate()`

---

## 🧪 Testing Strategy

### Sprint 1 (NOW)
```bash
# Manual testing con Expo Go
npm start
# Probar flujos:
# - Register → success → redirect to tabs
# - Login → success → persist session
# - Logout → redirect to login
# - Settings changes → persist to AsyncStorage
```

### Sprint 2 (Sensores)
```bash
# Development build requerido
npx expo run:android

# Testing:
# 1. App en foreground → mover device → ver logs de sensores
# 2. Conducir (o simular velocidad) → verificar trip start
# 3. Detenerse 60s → verificar trip end
# 4. Check AsyncStorage para buffers
```

### Sprint 3 (Scoring)
```typescript
// Unit tests para scoring
import { calculateTripScore } from './scoring';

test('perfect trip = 100 score', () => {
  const metrics = {
    harshBrakes: 0,
    harshAccels: 0,
    sharpTurns: 0,
    speedingDuration: 0,
  };
  expect(calculateTripScore(metrics).total).toBe(100);
});

// Integration test: mock trip → upload → verify Firestore
```

---

## 📞 Recursos y Ayuda

### Si te atoras en...

**Expo Router**:
- [Docs v57](https://docs.expo.dev/versions/v57.0.0/router/introduction/)
- File system = routes
- `(folder)` = route group (no aparece en URL)
- `[param]` = dynamic segment

**Firebase Auth**:
- [Web SDK Docs](https://firebase.google.com/docs/auth/web/start)
- Usar `onAuthStateChanged` para escuchar state
- AsyncStorage persistence es automática con `getAuth()`

**Sensores**:
- [Expo Sensors](https://docs.expo.dev/versions/v57.0.0/sdk/sensors/)
- [Expo Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- Testing: SIEMPRE en dispositivo físico

**Zustand**:
- [Docs](https://zustand-demo.pmnd.rs/)
- `create<Type>((set, get) => ({ ... }))`
- `set({ key: value })` para update
- `get()` para leer state dentro de actions

### Preguntas Frecuentes

**Q: ¿Por qué no se ve el score en tiempo real?**  
A: Decisión de diseño - scoring es post-viaje para ahorrar batería.

**Q: ¿Por qué Firebase JS SDK y no native?**  
A: Expo Go compatible sin rebuild, suficiente para MVP.

**Q: ¿Dónde están las Cloud Functions?**  
A: No implementadas aún, opcionales para MVP (Sprint 5).

**Q: ¿Cómo debuggear background tasks?**  
A: `console.log` va a Metro logs, ver con `npx expo start --verbose`.

**Q: ¿Tests unitarios?**  
A: No incluidos en MVP, agregar en Sprint 5 si hay tiempo.

---

## ✅ Acceptance Criteria (Sprints)

### Sprint 2 - Done When:
- [ ] Sensores leyendo datos cada 200ms (verificar logs)
- [ ] GPS tracking funciona en background (Android)
- [ ] Trip auto-start funciona (mock: velocidad > 15km/h por 10s)
- [ ] Trip auto-stop funciona (mock: velocidad < 5km/h por 60s)
- [ ] `activeTrip` se crea/destruye correctamente en `tripStore`
- [ ] UI de "Viaje en Progreso" funcional en dashboard

### Sprint 3 - Done When:
- [ ] Eventos detectados correctamente (4-signal validation)
- [ ] Score calculado según fórmula (tests pasan)
- [ ] Trip completo se sube a Firestore
- [ ] User stats se actualizan después de cada viaje
- [ ] Trip history carga viajes desde Firestore
- [ ] Botón "No soy conductor" funciona (dismissed flag)

### Sprint 4 - Done When:
- [ ] Dashboard muestra score gauge con datos reales
- [ ] Trend chart renderiza últimos 7 días
- [ ] Trip detail muestra eventos en timeline
- [ ] Score breakdown bars visibles
- [ ] Performance OK con 50+ viajes en historial

---

## 🚀 Quick Commands

```bash
# Start dev server
npm start

# Clear cache
npx expo start --clear

# Type check
npx tsc --noEmit

# Grep TODOs
grep -r "TODO Sprint" src/

# Development build
npx expo run:android
npx expo run:ios

# Firebase deploy
firebase deploy --only firestore:rules

# View logs
npx expo start --verbose
```

---

## 📝 Final Notes

- **Estado**: Sprint 1 completamente funcional ✅
- **Bloqueadores**: Ninguno
- **Dependencias externas**: Firebase (setup opcional)
- **Hardware requerido**: Dispositivo con GPS + acelerómetro (Sprint 2+)
- **Tiempo para productive**: ~30 minutos (leer docs + setup)

**Archivo más importante para empezar**: `AGENTS.md` → arquitectura completa

**Siguiente acción inmediata**: Implementar `sensorService.ts` (Sprint 2)

**Última actualización**: 2026-09-18

---

**Good luck! 🚗💨**
