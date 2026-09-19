# 🚀 Cómo Ejecutar y Probar el Proyecto

Guía paso a paso para configurar, iniciar y probar **Copiloto Responsable** en tu entorno de desarrollo.

---

## 1. Configuración de Variables de Entorno

1. Crea tu archivo de entorno local a partir de la plantilla:
   ```bash
   cp .env.example .env.local
   ```
2. Completa tus credenciales de Firebase en `.env.local` (puedes consultar [SETUP.md](./SETUP.md) para los pasos detallados de creación en Firebase Console).

---

## 2. Iniciar el Servidor de Desarrollo

```bash
# Iniciar Expo con Metro Bundler
npm start
```

### Opciones de visualización:
- **Dispositivo físico (Recomendado)**:
  1. Instala **Expo Go** desde Google Play o App Store.
  2. Escanea el código QR que se imprime en tu terminal.
- **Emulador Android**: Presiona `a` en la terminal donde corre Expo.
- **Simulador iOS**: Presiona `i` en la terminal.

---

## 3. Pruebas y Flujos Principales

### A. Autenticación y Perfil
1. **Registro**: Crea una cuenta nueva con correo y contraseña.
2. **Persistencia**: Cierra la aplicación y vuelve a abrirla; tu sesión se mantendrá activa automáticamente.
3. **Ajustes**: Ve a la pestaña **Perfil** para configurar alertas, límites de velocidad y tema.

### B. Monitoreo y Simulación de Manejo (Dashboard)
1. **Detección Automática**:
   - En condiciones reales, al superar 15 km/h durante 10 segundos, el estado pasará de `STANDBY` a `INICIANDO` y luego a `VIAJE EN CURSO`.
   - Al detenerse por más de 60 segundos, el viaje finalizará automáticamente.
2. **Simulador Integrado**:
   - En la tarjeta **Simulador de Pruebas**, pulsa el botón **35 km/h** o **90 km/h** para activar una marcha continua.
   - Observa la actualización en tiempo real del velocímetro, cronómetro y distancia acumulada.
   - Pulsa los botones de maniobra para inyectar eventos de prueba (*Frenada Brusca*, *Aceleración*, *Curva Peligrosa*).
   - Pulsa **0 km/h** o **Terminar y Guardar Viaje** para procesar y sincronizar con Firestore.

### C. Historial y Detalle de Viaje
1. Ve a la pestaña **Viajes** para ver el historial ordenado cronológicamente.
2. Desliza hacia abajo (**Pull-to-refresh**) para recargar viajes desde Firestore.
3. Toca cualquier viaje para acceder a su **Detalle**:
   - Medidor `ScoreGauge` interactivo con puntaje global (0-100).
   - Barras de progreso con el desglose de los 5 factores de conducción.
   - Cronología de eventos detectados con telemetría exacta (fuerzas G, velocidad y ángulos).
   - Botón *"No soy el conductor"* para descartar el viaje si ibas como pasajero.

---

## 4. Verificación de Código y Tests

```bash
# Ejecutar verificación de tipos TypeScript
npm run type-check

# Ejecutar suite de pruebas de lógica y algoritmos
npm test
```

---

## 5. Solución de Problemas Comunes

### Error: "Firebase app already exists"
Ejecuta `npm run clear` para vaciar el caché de Metro y reiniciar limpiamente.

### Error: "Missing or insufficient permissions" en Firestore
Asegúrate de haber desplegado las reglas de seguridad:
```bash
firebase deploy --only firestore:rules
```
Verifica en Firebase Console que tu base de datos Firestore esté en modo producción con las reglas provistas en `firestore.rules`.
