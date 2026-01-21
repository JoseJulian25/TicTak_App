# TicTak App – User-Level Specification

## Descripción General

TicTak es una aplicación de **tracking de tiempo** diseñada para permitir a los usuarios registrar el tiempo dedicado a su trabajo de forma **inmediata, simple y sin fricción**.

La aplicación puede utilizarse completamente **sin registro**, almacenando los datos localmente, y ofrece **sincronización en la nube** para quienes deseen acceder a su información desde múltiples dispositivos.

**Principios de diseño:**
- 🚀 **Cero fricción**: el usuario puede empezar a trackear tiempo inmediatamente
- 📱 **Responsive**: experiencia fluida en desktop y mobile
- 💾 **Login opcional**: solo necesario para sincronización multi-dispositivo
- 🎯 **Simplicidad**: interfaz limpia, enfocada en lo esencial
- 📊 **Métricas confiables**: estructura pensada para análisis y reportes futuros

---

## Funcionalidades Principales

### 1. Inicio de Sesión y Registro (Opcional)

#### Sin registro
- El usuario puede usar la app completamente sin crear una cuenta
- Los datos se almacenan en el `localStorage` del navegador
- Todas las funcionalidades están disponibles

#### Con registro
- Sincronización en la nube
- Acceso desde múltiples dispositivos
- **Migración de datos**: al registrarse, se ofrece importar los datos existentes desde `localStorage`

---

## Pantalla Principal: Timer

El **Timer** es lo primero que ve el usuario al entrar a la aplicación.

### Setup inicial (primer uso)
- La app crea automáticamente una estructura base:
  - Cliente: **Personal**
  - Proyecto: **General**
  - Tarea: **Trabajo en curso**
- El usuario puede empezar a trackear tiempo inmediatamente
- No se requiere ninguna configuración previa


### Interfaz del Timer:

```
┌────────────────────────────────────┐
│ Proyecto: [Dropdown con TreeView]  │
├────────────────────────────────────┤
│         ⏱️  02:34:12               │
│     [▶️ Iniciar]  [⏸️ Pausar]      │
├────────────────────────────────────┤
│ Hoy: 4h 45m (3 sesiones)           │
│ [Ver detalle ▼]  ← Expandible      │
└────────────────────────────────────┘
```


### Funcionalidades
- Selector de trabajo con jerarquía **Cliente → Proyecto → Tarea** (TreeView)
- Búsqueda rápida
- Cronómetro en tiempo real
- Resumen diario colapsable
- Al expandir: lista de registros de tiempo con opciones para editar o eliminar

---

## Sección: Proyectos

Vista de gestión y organización del trabajo del usuario.

La aplicación utiliza una **estructura jerárquica clara y orientada a métricas**, diseñada para escalar desde uso personal hasta trabajo profesional sin afectar la experiencia inicial.

### Estructura jerárquica (dominio real)
```
Cliente (opcional)
└── Proyecto
└── Tarea
└── Registros de tiempo
```


### Reglas clave
- Todo registro de tiempo pertenece siempre a una **tarea**
- Un proyecto puede o no estar asociado a un cliente
- Si una tarea no tiene cliente, se asigna automáticamente al cliente **"Personal"**
- Esta jerarquía garantiza métricas precisas por cliente, proyecto y tarea

### Setup automático (cero fricción)
- Cliente por defecto: **Personal**
- Proyecto por defecto: **General**
- Tarea inicial: **Trabajo en curso**

El usuario **no está obligado a crear ni organizar nada** para empezar.
La organización es opcional y puede realizarse posteriormente.


### Acciones disponibles
- Crear clientes, proyectos y tareas
- Renombrar elementos
- Mover tareas entre proyectos sin perder métricas
- Archivar proyectos o tareas
- Reorganización visual mediante drag & drop

---

## Sección: Estadísticas

Vista de análisis y visualización del tiempo trabajado.

### Resúmenes disponibles

1. **Resumen diario**
   - Tiempo total trabajado por día
   - Desglose por proyecto y tarea
   - Historial de días recientes

2. **Resumen mensual**
   - Tiempo total trabajado por mes
   - Comparación entre meses
   - Tendencias de productividad

3. **Resumen por proyecto**
   - Tiempo acumulado por proyecto
   - Promedio por día y por sesión
   - Distribución del tiempo entre proyectos

4. **Gráficas**
   - Gráfica diaria (barras o líneas)
   - Gráfica mensual acumulada
   - Distribución por proyecto

Todas las funcionalidades están disponibles tanto para usuarios con login como sin login.

---

## Navegación y Layout

### Desktop:
```
┌─────────────────────────────────────────────────┐
│ ⏱️ TrackerTime                      [👤 Login]  │
├──────────┬──────────────────────────────────────┤
│ ⏱️ Timer │                                      │
│ 📁 Proy. │      [Contenido Principal]          │
│ 📊 Stats │                                      │
└──────────┴──────────────────────────────────────┘
```

### Mobile:
```
┌─────────────────────┐
│ ⏱️ TrackerTime  [👤] │
├─────────────────────┤
│   [Contenido]       │
├─────────────────────┤
│ ⏱️  | 📁  | 📊     │ ← Bottom Navigation
└─────────────────────┘
```

**Componentes:**
- Header fijo: Logo + Login/Avatar
- Sidebar (desktop): 3 secciones
- Bottom Navigation (mobile): Navegación rápida
- Indicador visual de sección activa

---

### Componentes
- Header fijo: logo + login/avatar
- Sidebar (desktop): Timer, Proyectos, Estadísticas
- Bottom Navigation (mobile)
- Indicador visual de sección activa

---

## Flujo de Usuario

### Primera vez (sin login)
1. El usuario entra a la app
2. El Timer está listo inmediatamente
3. Click en ▶️ → comienza a trackear
4. Puede organizar su trabajo más tarde si lo desea

### Con login
1. El usuario se registra o inicia sesión
2. Se ofrece importar los datos locales
3. Los datos se sincronizan con la nube
4. Acceso desde cualquier dispositivo

### Uso diario
1. Abrir la app
2. Seleccionar tarea (opcional)
3. Iniciar timer
4. Pausar o detener al finalizar
5. Consultar estadísticas cuando lo necesite

---

## Objetivo Final

Crear una herramienta de tracking de tiempo que sea:

✅ **Inmediata**: empezar en segundos  
✅ **Flexible**: organización opcional y personalizable  
✅ **Escalable**: preparada para métricas, clientes y facturación  
✅ **Accesible**: usable sin cuenta  
✅ **Simple**: enfocada en el trabajo, no en la herramienta  

**Meta:** permitir que los usuarios se concentren en su trabajo, no en gestionar el tiempo.