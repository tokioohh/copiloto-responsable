# 🚗 Copiloto Responsable

> Aplicación móvil inteligente para la monitorización de hábitos de conducción y seguridad vial. Utiliza los sensores nativos del smartphone para evaluar la calidad de manejo en tiempo real y calcular un puntaje de seguridad (0–100) por recorrido.

---

## 🌟 Características Principales

- **Detección Automática de Recorridos**: Algoritmo basado en una máquina de 4 estados que inicia el seguimiento al detectar velocidad de marcha (>15 km/h) y lo finaliza automáticamente tras detenerse (>60s).
- **Algoritmo de Calificación Multidimensional**: Puntaje global de 0 a 100 con desglose por categorías:
  - 🛑 **Frenado Suave** (30 pts)
  - 🏎️ **Aceleración Progresiva** (25 pts)
  - ⚠️ **Velocidad Regulada** (20 pts)
  - 🔄 **Giros Controlados** (15 pts)
  - 📱 **Atención al Volante** (10 pts)
- **Fusión de Sensores y Detección de Maniobras**: Filtrado y validación de fuerzas G, aceleraciones angulares y velocidad GPS para evitar falsos positivos por movimientos involuntarios del teléfono.
- **Visualización y Analítica Avanzada**:
  - Indicador concéntrico dinámico (`ScoreGauge`) con categorización cualitativa y estrellas.
  - Gráfica de evolución temporal (`TrendChart`) con curvas Bézier de los últimos viajes.
  - Línea de tiempo cronológica (`EventTimeline`) con telemetría de cada maniobra registrada.
- **Gestión Inteligente de Pasajero**: Botón *"No soy el conductor"* que permite descartar trayectos en transporte público o como acompañante, recalculando las estadísticas acumuladas.
- **Simulador y Diagnóstico en Vivo**: Controles dentro de la app para pruebas de velocidad (35 km/h, 90 km/h, paradas), inyección de eventos y monitoreo de sensores en tiempo real.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework Móvil** | [React Native](https://reactnative.dev/) con [Expo SDK 57](https://expo.dev/) |
| **Enrutamiento** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Backend & Cloud** | [Firebase](https://firebase.google.com/) JS SDK (Authentication + Cloud Firestore) |
| **Gestión de Estado** | [Zustand](https://github.com/pmndrs/zustand) |
| **Librería de Componentes** | [React Native Paper](https://callstack.github.io/react-native-paper/) (Material Design 3) |
| **Gráficas** | [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) + SVG |
| **Tipado** | [TypeScript](https://www.typescriptlang.org/) con modo estricto |

---

## 📂 Estructura del Proyecto

```
copiloto-responsable/
├── app/                      # Pantallas y navegación (Expo Router)
│   ├── (auth)/              # Rutas de autenticación (Login / Registro)
│   ├── (tabs)/              # Navegación principal (Dashboard, Viajes, Perfil)
│   ├── trip/[id].tsx        # Pantalla de detalle de viaje
│   └── _layout.tsx          # Configuración de rutas y tema Paper
│
├── src/
│   ├── components/          # Componentes de interfaz (ScoreGauge, TrendChart, EventTimeline, etc.)
│   ├── services/            # Servicios de sensores, GPS, detección y Firestore
│   ├── stores/              # Estado reactivo con Zustand (authStore, tripStore, settingsStore)
│   ├── hooks/               # Custom hooks de telemetría y lectura de sensores
│   ├── utils/               # Fusión de sensores, cálculo de score, dateUtils y constantes
│   ├── types/               # Definiciones de TypeScript
│   └── config/              # Inicialización de Firebase
│
├── scripts/                 # Scripts de verificación y pruebas unitarias
├── firestore.rules          # Reglas de seguridad de Firestore
├── firestore.indexes.json   # Definición de índices de base de datos
├── .env.example             # Plantilla de variables de entorno (sin credenciales)
└── package.json             # Dependencias y scripts de ejecución
```

---

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio e Instalar Dependencias

```bash
git clone https://github.com/tu-usuario/copiloto-responsable.git
cd copiloto-responsable
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de plantilla `.env.example` y nómbralo `.env.local`:

```bash
cp .env.example .env.local
```

Completa tus claves de proyecto de Firebase en `.env.local`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> 📖 Para una guía paso a paso sobre cómo crear el proyecto en Firebase Console, consulta [SETUP.md](./SETUP.md).

### 3. Ejecutar la Aplicación

```bash
# Iniciar el servidor de desarrollo Expo
npm start
```

- **Dispositivo Móvil**: Abre la app **Expo Go** en Android o iOS y escanea el código QR desplegado en la terminal.
- **Emulador**: Presiona `a` para Android o `i` para iOS en la terminal interactiva.

---

## 🧪 Pruebas y Calidad de Código

```bash
# Ejecutar suite de pruebas de lógica y algoritmos
npm test

# Verificación de tipos estáticos de TypeScript
npm run type-check

# Limpiar caché de Metro Bundler
npm run clear
```

---

## 🔒 Privacidad y Seguridad

1. **Sin Almacenamiento de Sensores Raw**: Por privacidad de los usuarios y eficiencia en el uso de batería y datos, la app **no almacena** trayectorias continuas ni grabaciones brutas de acelerómetro/giroscopio en la nube; solo se sincronizan los eventos de maniobras confirmadas y las métricas resumidas.
2. **Protección de Credenciales**: El archivo `.env.local` está explícitamente ignorado en `.gitignore` para garantizar que ninguna clave privada sea enviada al repositorio.
3. **Reglas de Seguridad**: Firestore implementa reglas de acceso estricto donde cada usuario solo puede leer y modificar sus propios viajes y perfil (`firestore.rules`).

---

## 📄 Licencia

Distribuido bajo la Licencia [MIT](./LICENSE). Consulta el archivo `LICENSE` para más información.
