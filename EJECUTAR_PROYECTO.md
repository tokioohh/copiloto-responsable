# 🚀 Cómo Ejecutar el Proyecto

## Configuración Rápida (5 minutos)

### 1. Configurar Firebase

**Opción A: Usar credenciales de ejemplo (solo para ver UI)**
- ✅ El proyecto ya tiene `.env.local` con placeholders
- ⚠️ La autenticación NO funcionará sin credenciales reales

**Opción B: Configurar Firebase real (recomendado)**
1. Abre `SETUP.md` y sigue los pasos
2. Copia tus credenciales a `.env.local`
3. Despliega las reglas: `firebase deploy --only firestore:rules`

### 2. Iniciar el Proyecto

```bash
# Ya están instaladas las dependencias, solo ejecuta:
npm start
```

### 3. Abrir en Dispositivo

**Con Expo Go (más rápido para empezar):**
1. Instala Expo Go en tu teléfono
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Escanea el QR que aparece en la terminal

**Con simulador (si tienes uno instalado):**
- iOS: Presiona `i` en la terminal
- Android: Presiona `a` en la terminal

---

## Testing del Sprint 1

### ✅ Lo que FUNCIONA ahora (con Firebase configurado)

1. **Registro de Usuario**
   - Abre la app
   - Toca "Regístrate"
   - Ingresa email y contraseña
   - Verifica en Firebase Console que se creó el usuario

2. **Login**
   - Cierra la app (force quit)
   - Abre de nuevo
   - Login automático por persistencia
   - O logout y login manual

3. **Navegación**
   - Tabs: Inicio, Viajes, Perfil
   - Todas las pantallas son navegables

4. **Settings**
   - Ve a Perfil
   - Cambia configuraciones
   - Se guardan en AsyncStorage local

### ⚠️ Lo que aún NO funciona (Sprints 2-4)

- ❌ Detección automática de viajes (Sprint 2)
- ❌ Sensores (acelerómetro/GPS) (Sprint 2)
- ❌ Cálculo de puntajes (Sprint 3)
- ❌ Gráficas con datos reales (Sprint 4)
- ❌ Historial de viajes desde Firestore (Sprint 3)

---

## Verificar que Todo Esté Bien

### Check 1: Compilación
```bash
npx tsc --noEmit
```
**Resultado esperado**: Sin output (significa sin errores)

### Check 2: Firebase Connection
1. Configura Firebase en `.env.local`
2. Abre la app
3. Intenta registrarte
4. Ve a [Firebase Console](https://console.firebase.google.com/)
5. Authentication → Users → Deberías ver el usuario

### Check 3: Firestore
1. Después del registro
2. Ve a Firestore Database en Firebase Console
3. Colección `users` → Deberías ver tu documento de usuario

---

## Estructura del Proyecto

```
copiloto-responsable/
├── app/                      # Pantallas (Expo Router)
│   ├── (auth)/              # Login/Register
│   ├── (tabs)/              # Home, Viajes, Perfil
│   └── trip/                # Detalle de viaje
│
├── src/
│   ├── components/          # UI components reutilizables
│   ├── services/            # Lógica de negocio
│   ├── stores/              # Estado global (Zustand)
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilidades
│   └── config/              # Configuración
│
├── .env.local               # ⚠️ TUS CREDENCIALES AQUÍ
├── firebase.json            # Config Firebase
├── firestore.rules          # Reglas de seguridad
└── package.json             # Dependencias
```

---

## Troubleshooting Común

### "Firebase app already exists"
```bash
npx expo start --clear
```

### "Permission denied" en Firestore
- Verifica que desplegaste las reglas: `firebase deploy --only firestore:rules`
- Verifica en Firebase Console > Firestore > Reglas

### La app no abre
```bash
# Limpia cache y reinstala
npx expo start --clear
rm -rf node_modules package-lock.json
npm install
```

### Sensores no funcionan
- ⚠️ Normal: Sensores y GPS se implementan en Sprint 2
- Expo Go tiene limitaciones con background location
- Para testing real de sensores: necesitarás development build

---

## Próximos Pasos de Desarrollo

### Sprint 2 (siguiente)
```bash
# Implementar servicios de sensores
code src/services/sensorService.ts
code src/services/locationService.ts
code src/services/tripDetector.ts
```

Ver `PROJECT_STATUS.md` para roadmap completo.

---

## Recursos Útiles

- 📖 [Expo Docs](https://docs.expo.dev/)
- 🔥 [Firebase Console](https://console.firebase.google.com/)
- 📱 [Expo Go](https://expo.dev/go)
- 💬 [Expo Discord](https://chat.expo.dev/)

---

## Comandos Útiles

```bash
# Iniciar proyecto
npm start

# Limpiar cache
npx expo start --clear

# Ver logs detallados
npx expo start --verbose

# Compilar TypeScript
npx tsc --noEmit

# Deploy Firebase rules
firebase deploy --only firestore:rules
```

---

**¿Listo para empezar?**

```bash
npm start
```

🎉 ¡El proyecto está funcionando! Escanea el QR y explora la app.
