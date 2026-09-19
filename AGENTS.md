# Copiloto Responsable - Guía de Arquitectura y Desarrollo

> App móvil de telemetría y seguridad vial que analiza el estilo de conducción del usuario utilizando los sensores del smartphone (acelerómetro, giroscopio y GPS) para calcular un puntaje de manejo seguro (0-100) por recorrido.

---

## Stack Tecnológico

- **Frontend**: React Native + Expo SDK 57
- **Enrutamiento**: Expo Router (file-based routing)
- **Backend**: Firebase JS SDK v12 (Authentication + Cloud Firestore)
- **Manejo de Estado**: Zustand
- **Diseño & Componentes**: React Native Paper
- **Visualización de Datos**: React Native Chart Kit + React Native SVG

---

## Arquitectura del Proyecto

```
app/                          # Pantallas y rutas protegidas (Expo Router)
  (auth)/                    # Autenticación (Login / Registro)
  (tabs)/                    # Navegación principal por pestañas
    index.tsx                # Dashboard principal, telemetría y simulación
    trips.tsx                # Historial de viajes con pull-to-refresh
    profile.tsx              # Ajustes de usuario y configuración
  trip/[id].tsx              # Detalle de viaje, métricas y desglose

src/
  stores/                    # Estado global con Zustand
    authStore.ts             # Sesión, usuario y perfil de Firestore
    tripStore.ts             # Viaje en curso, historial local y sincronización
    settingsStore.ts         # Preferencias locales (AsyncStorage)
    
  services/                  # Lógica de negocio y servicios externos
    sensorService.ts         # Acelerómetro y giroscopio con muestreo adaptativo
    locationService.ts       # Seguimiento GPS y cálculo de distancias (Haversine)
    tripDetector.ts          # Máquina de estados para inicio/fin automático
    tripProcessor.ts         # Pipeline de detección de eventos y métricas
    firebaseService.ts       # Operaciones de Firestore (viajes, usuarios, estadísticas)
    
  utils/
    sensorFusion.ts          # Algoritmos de validación de maniobras bruscas
    scoring.ts               # Algoritmo de cálculo de puntaje (0-100)
    dateUtils.ts             # Normalización de fechas y Timestamps de Firestore
    constants.ts             # Umbrales físicos, tiempos y pesos de puntuación
    
  components/                # Componentes UI reutilizables
    ScoreGauge.tsx           # Indicador concéntrico de puntaje con calificación
    TrendChart.tsx           # Gráfica de evolución temporal (LineChart)
    TripCard.tsx             # Tarjeta resumen de viaje para listas
    EventTimeline.tsx        # Línea de tiempo de eventos con telemetría
    DismissTripButton.tsx    # Acción "No soy el conductor"
    MetricRow.tsx            # Fila de métricas clave

  config/
    firebase.ts              # Inicialización y configuración de Firebase SDK
```

---

## Decisiones Clave de Diseño

### 1. Firebase JS SDK
Utiliza el SDK de JavaScript de Firebase para compatibilidad directa tanto en Expo Go como en builds nativos de desarrollo, simplificando la iteración rápida.

### 2. Procesamiento en Tiempo Real sin Almacenamiento Raw
No se guardan lecturas continuas de sensores en la base de datos para minimizar consumo de datos, batería y costos de almacenamiento. Solo se registran los eventos confirmados y métricas acumuladas.

### 3. Pipeline de Scoring Post-Viaje
Al terminar el viaje, se procesan los buffers de eventos y rutas localmente, calculando el puntaje y las métricas antes de sincronizar el documento final en Firestore.

### 4. Detección Automática con Máquina de Estados
Implementa 4 estados controlados:
- **`idle`**: Vehículo en reposo.
- **`starting`**: Velocidad $\ge 15\text{ km/h}$ detectada continuamente por $10\text{ segundos}$.
- **`active`**: Viaje en curso (registro de telemetría y eventos).
- **`ending`**: Vehículo detenido ($< 5\text{ km/h}$) por $60\text{ segundos}$ continuos.

### 5. Muestreo Adaptativo de Sensores
- **Frecuencia alta (5 Hz)** durante la conducción y maniobras activas.
- **Frecuencia reducida (2 Hz)** tras períodos prolongados sin actividad para optimizar la batería.

---

## Algoritmo de Puntuación (0-100)

| Categoría | Peso Máximo | Penalización |
|---|---|---|
| **Frenado Suave** | 30 pts | $-5\text{ pts}$ por frenada brusca |
| **Aceleración Progresiva** | 25 pts | $-5\text{ pts}$ por aceleración brusca |
| **Velocidad Regulada** | 20 pts | $-2\text{ pts}$ por minuto sobre el límite |
| **Giros Controlados** | 15 pts | $-3\text{ pts}$ por giro brusco |
| **Atención al Volante** | 10 pts | $-2\text{ pts}$ por manipulación indebida |

---

## Modelo de Datos (Firestore)

### Colección: `users`
```typescript
{
  uid: string;
  email: string;
  displayName?: string;
  settings: {
    notifications: boolean;
    autoDetection: boolean;
    speedLimit: number;
  };
  stats: {
    totalTrips: number;
    averageScore: number;
    totalDistance: number;   // km
    totalDuration: number;   // segundos
  };
}
```

### Colección: `trips`
```typescript
{
  id: string;
  userId: string;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;          // segundos
  distance: number;          // km
  dismissed: boolean;        // true si el usuario no conducía
  route: RoutePoint[];       // coordenadas muestreadas
  events: DrivingEvent[];    // frenadas, aceleraciones, giros, excesos
  metrics: TripMetrics;
  score: {
    total: number;           // 0-100
    breakdown: ScoreBreakdown;
  };
}
```

---

## Comandos del Proyecto

```bash
# Iniciar servidor de desarrollo Expo
npm start

# Ejecutar suite de pruebas de lógica
npm test

# Verificación de tipos TypeScript
npm run type-check

# Limpiar cache de Metro
npm run clear
```

---

## Convenciones

- **Código**: Nombres de variables, funciones, interfaces y comentarios técnicos en **inglés**.
- **Interfaz de Usuario**: Textos, mensajes de error y etiquetas para el usuario en **español**.
- **Variables de Entorno**: Las claves de Firebase se configuran en `.env.local` y nunca se suben al repositorio. Usar `.env.example` como plantilla.
