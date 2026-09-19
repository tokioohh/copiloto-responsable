# Copiloto Responsable - Guía Rápida

> App móvil para análisis de calidad de conducción mediante sensores de smartphone y cálculo de puntaje 0-100 por viaje.

---

## 📌 Información Esencial

- **Stack**: React Native + Expo SDK 57 + Firebase JS SDK + Zustand
- **Navegación**: Expo Router (file-based)
- **Componentes**: React Native Paper
- **Gráficas**: React Native Chart Kit

---

## 🏗️ Estructura del Código

```
app/                # Pantallas (Expo Router)
  (auth)/          # Login y Registro
  (tabs)/          # Inicio (Dashboard), Viajes (Historial), Perfil
  trip/[id].tsx    # Detalle del viaje

src/
  components/      # Componentes UI (ScoreGauge, TrendChart, TripCard, EventTimeline, etc.)
  services/        # Servicios (sensorService, locationService, tripDetector, tripProcessor, firebaseService)
  stores/          # Stores globales (authStore, tripStore, settingsStore)
  types/           # Tipos e interfaces de TypeScript
  utils/           # Algoritmos (sensorFusion, scoring, dateUtils, constants)
  config/          # Configuración de Firebase
```

---

## ⚡ Comandos Principales

```bash
npm start              # Iniciar Expo dev server
npm test               # Ejecutar suite de pruebas unitarias
npm run type-check     # Verificación de tipos TypeScript
npm run clear          # Limpiar caché de Expo / Metro
```

---

## 🔒 Variables de Entorno

Las credenciales de Firebase se configuran en `.env.local` tomando como plantilla `.env.example`. Nunca commitear `.env.local`.
