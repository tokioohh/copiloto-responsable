# 👋 START HERE

Bienvenido a **Copiloto Responsable**. Este proyecto tiene documentación completa. Aquí está el orden recomendado de lectura según tu rol:

---

## 🚀 Si quieres EJECUTAR el proyecto YA

```bash
npm start
```

Lee: **[EJECUTAR_PROYECTO.md](./EJECUTAR_PROYECTO.md)** (5 min)

---

## 👨‍💻 Si vas a DESARROLLAR el proyecto

### Paso 1: Contexto (15 min)
1. **[AGENTS.md](./AGENTS.md)** ← Empieza aquí
   - Arquitectura completa
   - Decisiones de diseño
   - Estado actual vs pendiente

### Paso 2: Handoff (10 min)
2. **[HANDOFF.md](./HANDOFF.md)**
   - Checklist de inicio
   - Cómo implementar Sprint 2
   - Problemas conocidos
   - Acceptance criteria

### Paso 3: Setup (10 min)
3. **[SETUP.md](./SETUP.md)**
   - Configurar Firebase
   - Variables de entorno
   - Deployment de rules

### Paso 4: Roadmap (5 min)
4. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)**
   - Sprints completos
   - TODOs por archivo
   - Métricas de éxito

---

## 🏢 Si eres STAKEHOLDER/PM

Lee en orden:
1. **[README.md](./README.md)** - Overview del proyecto (5 min)
2. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Roadmap completo (10 min)
3. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumen técnico (5 min)

---

## 🎯 Quick Reference

| Documento | Propósito | Audiencia | Tiempo |
|-----------|-----------|-----------|---------|
| **AGENTS.md** | Arquitectura y handoff técnico | Developers | 15 min |
| **HANDOFF.md** | Guía práctica de inicio | New developer | 10 min |
| **EJECUTAR_PROYECTO.md** | Cómo correr la app | Anyone | 5 min |
| **SETUP.md** | Firebase configuration | Developer | 10 min |
| **PROJECT_STATUS.md** | Sprint roadmap | PM/Developer | 10 min |
| **README.md** | Project overview | Anyone | 5 min |
| **IMPLEMENTATION_SUMMARY.md** | Resumen técnico | Technical lead | 5 min |

---

## ⚡ TL;DR

```bash
# 1. Lee AGENTS.md para entender todo
cat AGENTS.md

# 2. Configura Firebase (opcional)
cat SETUP.md

# 3. Ejecuta
npm start

# 4. Siguiente: implementar Sprint 2
cat HANDOFF.md
```

---

## 🗂️ Estructura de Archivos

```
copiloto-responsable/
│
├── START_HERE.md              ← Estás aquí
├── AGENTS.md                  ← Documentación principal (LEER PRIMERO)
├── HANDOFF.md                 ← Guía práctica de handoff
├── PROJECT_STATUS.md          ← Roadmap de sprints
├── EJECUTAR_PROYECTO.md       ← Cómo ejecutar
├── SETUP.md                   ← Setup de Firebase
├── README.md                  ← Overview
├── IMPLEMENTATION_SUMMARY.md  ← Resumen técnico
│
├── app/                       ← Screens (Expo Router)
├── src/                       ← Source code
├── .env.local                 ← Firebase credentials (configurar)
├── firebase.json              ← Firebase config
├── firestore.rules            ← Security rules
└── package.json               ← Dependencies
```

---

## ❓ FAQs

**P: ¿Qué funciona ahora?**  
R: Autenticación completa + navegación + UI. Ver [PROJECT_STATUS.md](./PROJECT_STATUS.md)

**P: ¿Qué falta?**  
R: Sensores (Sprint 2), Scoring (Sprint 3), Gráficas (Sprint 4).

**P: ¿Por dónde empiezo a desarrollar?**  
R: Lee [AGENTS.md](./AGENTS.md), luego [HANDOFF.md](./HANDOFF.md), implementa Sprint 2.

**P: ¿Necesito Firebase?**  
R: Opcional para ver UI. Obligatorio para funcionalidad completa.

**P: ¿Cuánto tarda setup?**  
R: 10 min con Firebase, 2 min sin Firebase (solo UI).

**P: ¿Dónde están los TODOs?**  
R: `grep -r "TODO Sprint" src/`

---

## 📞 Ayuda

Si te atoras:
1. Busca en [HANDOFF.md](./HANDOFF.md) → "Problemas Conocidos"
2. Revisa [AGENTS.md](./AGENTS.md) → "Troubleshooting"
3. Google con: "Expo v57 [tu problema]"

---

## ✅ Estado Actual

- ✅ Sprint 1: Completado
- 🚧 Sprint 2: Listo para empezar
- 🚧 Sprints 3-6: Pendientes

**Última actualización**: 2026-09-18

---

**¡Bienvenido al proyecto! 🚗**

Siguiente paso recomendado: **[AGENTS.md](./AGENTS.md)** →
