# Tu jardín de hábitos

Un rastreador de hábitos basado en identidad: cada hábito tiene una
frase de identidad, una "profundidad de raíz" que crece con la
constancia (y se debilita despacio, no de golpe, si fallas un día), y
una ilustración de planta que crece en 5 etapas junto con tu progreso.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org/) 18 o más reciente instalado.

```bash
npm install
npm run dev
```

Abre la URL que te muestre la terminal (normalmente `http://localhost:5173`).

Para generar una versión de producción optimizada:

```bash
npm run build
npm run preview   # sirve la build de producción localmente para probarla
```

## Arquitectura Offline-First y Sincronización en la Nube

La aplicación está diseñada para funcionar **100% sin conexión a internet** (Offline-First).
Todos tus datos se guardan inmediatamente en la base de datos local de tu dispositivo (`IndexedDB`).

- **Si estás conectado:** Los cambios se sincronizan en tiempo real con Supabase. Si abres la app en tu PC y en tu celular al mismo tiempo, los cambios aparecerán al instante por WebSockets.
- **Si estás desconectado:** Puedes seguir creando hábitos, registrando gastos o marcando objetivos. La aplicación encolará (guardará en una cola interna) todas tus acciones. La próxima vez que te conectes a internet, la aplicación enviará automáticamente todos tus cambios pendientes a la nube sin que pierdas un solo dato.

Se soporta inicio de sesión con Google o Correo Electrónico.

## Estructura del proyecto

```
src/
  domain/       Lógica pura de negocio — sin React, sin UI.
                Fechas, racha, profundidad de raíz, anillos de
                crecimiento, validación de frecuencia. Se puede leer
                y probar sin levantar la aplicación.

  storage/      La persistencia como una interfaz intercambiable
                (StorageAdapter: getItem/setItem). Dos implementaciones:
                localStorage (uso normal) y el window.storage de
                artefactos de Claude (si corre en ese entorno).
                index.js decide cuál usar; el resto de la app no lo sabe.

  theme/        Los 4 temas (Tierra, Azul formal, Gris y negro,
                Naturaleza) como datos, más el contexto de React que
                los distribuye sin prop drilling.

  hooks/        El puente entre domain/storage y los componentes:
                useHabits, useThemeChoice, useCalendarNavigation,
                useHabitModal, useGrowthPulse, y usePersistedState
                (la plomería genérica de guardado que las demás usan).

  components/   Un subfolder por responsabilidad de UI:
                common/            Modal, Stat — piezas genéricas
                growth-illustration/  La planta SVG animada
                theme-picker/      Selector de tema
                habit-form/        Formulario de crear/editar
                habit-grid/        La tabla cuadriculada
                habit-modal/       El modal de detalle de un hábito
                layout/            Header, toolbar, navegación, vacío

  App.jsx       Compone hooks + componentes. No contiene lógica de
                negocio propia — si buscas "cómo se calcula la racha",
                está en domain/, no aquí.
```

## Por qué está organizado así (principios SOLID)

- **Responsabilidad única** — cada archivo de `domain/` calcula una
  sola cosa (fechas, racha, raíz, anillos). Cada componente de UI
  renderiza una sola pieza.
- **Abierto/cerrado** — los temas y las etapas de crecimiento
  (`STAGES` en `rootDepth.js`) son listas de datos, no cadenas de
  `if/else`. Agregar un tema o una etapa nueva no toca la lógica que
  los usa.
- **Sustitución de Liskov** — `StorageAdapter` define un contrato
  (`getItem`/`setItem`); `localStorageAdapter` y
  `claudeArtifactStorageAdapter` lo cumplen de forma intercambiable.
- **Segregación de interfaces** — los componentes reciben solo las
  props que usan (p. ej. `DayCell` no conoce el hábito completo, solo
  la fecha, si está completado, y un color).
- **Inversión de dependencias** — los componentes dependen de hooks
  (`useHabits`, `useTheme`), nunca directamente de `localStorage` ni
  de la API de almacenamiento. Cambiar cómo se persisten los datos
  significa tocar `storage/`, no cada componente.
