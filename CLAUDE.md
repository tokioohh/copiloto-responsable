# Copiloto Responsable - Claude Context

> App móvil fitness tracker para conducción. Analiza calidad de manejo con sensores del smartphone y calcula puntaje 0-100 por viaje.

---

## 📌 Información Esencial

**Estado**: Sprint 1 completado (16% del MVP)  
**Stack**: React Native + Expo 57 + Firebase + Zustand  
**Routing**: Expo Router (file-based)

---

## 🏗️ Arquitectura Rápida

```
app/                # Screens (Expo Router)
  (auth)/          # Login/Register
  (tabs)/          # Home, Trips, Profile
  trip/[id].tsx    # Trip detail

src/
  stores/          # Zustand (authStore ✅, tripStore 🚧)
  services/        # Business logic (todos en Sprint 2-3)
  components/      # UI components ✅
  types/           # TypeScript interfaces ✅
  utils/           # Scoring + sensor fusion (Sprint 3)
```

---

## ⚡ Quick Commands

```bash
npm start              # Ejecutar app
npm run type-check     # TypeScript
npm run todos          # Ver TODOs Sprint 2-3
npm run clear          # Limpiar cache
```

---

## 📚 Documentación

**Si eres un agente AI nuevo**:
1. Lee **[AGENTS.md](./AGENTS.md)** primero (15 min)
2. Lee **[HANDOFF.md](./HANDOFF.md)** (10 min)
3. Verifica estado en **[PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)**

**Si el usuario pregunta cómo ejecutar**:
- Dirígelo a **[EJECUTAR_PROYECTO.md](./EJECUTAR_PROYECTO.md)**

**Si el usuario quiere configurar Firebase**:
- Dirígelo a **[SETUP.md](./SETUP.md)**

**Si el usuario pregunta qué falta**:
- Dirígelo a **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** o **[PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)**

---

## ✅ Lo que FUNCIONA (Sprint 1)

- Autenticación Firebase (login/register)
- Protected routes con Expo Router
- 3 tabs: Home, Viajes, Perfil
- Settings locales (AsyncStorage)
- Firestore rules + indexes
- TypeScript sin errores

---

## 🚧 Lo que FALTA

### Sprint 2 (siguiente)
- Sensores (acelerómetro, giroscopio, GPS)
- Trip detection automático
- Background tracking

### Sprint 3
- Sensor fusion (detección de eventos)
- Scoring algorithm
- Firestore CRUD completo

### Sprint 4
- Gráficas con datos reales
- Dashboard completo
- Trip history desde Firestore

---

## 🎯 Decisiones Clave

1. **Firebase JS SDK** (no `@react-native-firebase`) → Expo Go compatible
2. **No storage de datos raw** → Solo eventos procesados
3. **Scoring post-viaje** → No real-time (ahorro batería)
4. **Adaptive sampling** → 5Hz eventos, 2Hz calma
5. **Expo Router** → File-based, no React Navigation

---

## 🔥 Reglas Importantes

### Al modificar código:
- **Código**: Inglés
- **UI strings**: Español
- **Comentarios**: Inglés, solo cuando el "por qué" no es obvio

### Al implementar Sprint 2+:
- Leer **thresholds** en `src/utils/constants.ts` PRIMERO
- Testing SIEMPRE en dispositivo físico (sensores no funcionan en simulador)
- Development build requerido para background location

### Firestore:
- User ID match validado en rules
- Trips tienen `dismissed` flag para "No soy conductor"
- Stats se actualizan después de cada viaje

---

## 📂 Archivos Importantes

| Archivo | Estado | Notas |
|---------|--------|-------|
| `src/stores/authStore.ts` | ✅ | Ejemplo de store completo |
| `src/stores/tripStore.ts` | 🚧 | TODOs Sprint 3 |
| `src/services/sensorService.ts` | 🚧 | TODO Sprint 2 |
| `src/services/tripDetector.ts` | 🚧 | State machine (4 estados) |
| `src/utils/scoring.ts` | 🚧 | Formula documentada, TODO impl |
| `src/config/firebase.ts` | ✅ | Ya configurado |

---

## 🐛 Problemas Conocidos

1. **Background location NO funciona en Expo Go**
   - Solución: Development build (`npx expo run:android`)

2. **Sensores no responden en simulador**
   - Solución: Testing en dispositivo real

3. **Firebase persistence**
   - ✅ Ya resuelto con `getAuth()`

---

## 🔍 Buscar Info

```bash
# TODOs por sprint
grep -r "TODO Sprint 2" src/
grep -r "TODO Sprint 3" src/

# Ver thresholds
cat src/utils/constants.ts

# Ver tipos
cat src/types/trip.ts
cat src/types/user.ts
```

---

## 💡 Tips para Agentes AI

### Cuando el usuario pida implementar algo:
1. Verificar en qué sprint está (PROJECT_CHECKLIST.md)
2. Leer los TODOs del archivo antes de implementar
3. Seguir convenciones: código inglés, UI español
4. NO cambiar thresholds sin justificación

### Cuando el usuario reporte un error:
1. Verificar si es problema conocido (HANDOFF.md → "Problemas Conocidos")
2. Verificar estado de Firebase (si es auth/firestore)
3. Verificar permisos (si son sensores)

### Cuando el usuario pregunte "¿qué sigue?":
- Apuntar a Sprint 2 implementation en HANDOFF.md
- Mostrar checklist de Sprint 2 en PROJECT_CHECKLIST.md

---

## 🎓 Referencias Expo v57

- [Sensors](https://docs.expo.dev/versions/v57.0.0/sdk/sensors/)
- [Location](https://docs.expo.dev/versions/v57.0.0/sdk/location/)
- [Task Manager](https://docs.expo.dev/versions/v57.0.0/sdk/task-manager/)
- [Router](https://docs.expo.dev/versions/v57.0.0/router/introduction/)

---

**Última actualización**: 2026-09-18  
**Compilación**: ✅ TypeScript sin errores  
**Testing**: ✅ Auth flow funcional en Expo Go

---

Para más detalles, consultar **[AGENTS.md](./AGENTS.md)** (documentación completa para agentes).
