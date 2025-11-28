# Sistema de Gestión de Inventario

Una aplicación web moderna y fácil de usar para gestionar el inventario en múltiples tiendas físicas. Construida con Vue 3, Vuetify 3 y Pinia para la gestión del estado.

## 🚀 Características

### 🔐 Autenticación y Gestión de Usuarios
- **Control de acceso basado en roles** (Administrador, Gerente, Empleado)
- **Sistema de inicio de sesión seguro** con correo electrónico/contraseña
- **Gestión de usuarios** para administradores
- **Persistencia de sesión** con localStorage

### 📊 Panel de Control (Dashboard)
- **Tarjetas de resumen** que muestran métricas clave
- **Estadísticas en tiempo real** de productos, tiendas y transacciones
- **Alertas de stock bajo** con indicadores visuales
- **Actividad reciente** filtrada por tienda del usuario
- **Top 5 Productos** más vendidos, visualizados gráficamente y filtrados por tienda
- **Tendencias de ventas** y análisis de rendimiento

### 📦 Gestión de Productos
- **Operaciones CRUD completas** para productos
- **Búsqueda avanzada** por nombre, SKU o categoría
- **Categorización de productos**
- **Gestión de precios y descripciones**
- **Soporte para operaciones masivas**

### 🏪 Gestión de Inventario
- **Seguimiento de inventario multi-tienda**
- **Niveles de stock en tiempo real** con alertas
- **Historial de movimientos** de stock
- **Vistas de inventario** específicas por tienda
- **Personalización de niveles de stock** por tienda

### 💰 Gestión de Transacciones
- **Múltiples tipos de transacciones**: Ventas, Transferencias, Recepciones
- **Seguimiento exhaustivo** de todos los movimientos de inventario
- **Filtrado por fecha y tienda**
- **Historial de transacciones** con información detallada
- **Transferencias entre tiendas**
- **Detección de Transacciones Inusuales**: Visualización de movimientos de alto volumen o anómalos

### 📈 Reportes y Análisis
- **Tendencias de ventas** y métricas de rendimiento
- **Comparativa de tiendas**
- **Análisis de productos más vendidos**
- **Valoración de inventario**
- **Funcionalidad de exportación** para reportes

## 🛠️ Stack Tecnológico

- **Frontend Framework**: Vue 3 (Composition API)
- **UI Framework**: Vuetify 3
- **Gestión de Estado**: Pinia
- **Enrutamiento**: Vue Router 4
- **Herramienta de Construcción**: Vite
- **Iconos**: Material Design Icons (MDI)
- **Estilos**: CSS con sistema de diseño Vuetify

## 🚀 Comenzando

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd tbd-front
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir para producción**
   ```bash
   npm run build
   ```

## 🔑 Credenciales de Demo

### Usuario Administrador
- **Email**: admin@store.com
- **Contraseña**: admin123
- **Acceso**: Acceso total al sistema, incluyendo gestión de usuarios

### Usuario Empleado
- **Email**: employee@store.com
- **Contraseña**: emp123
- **Acceso**: Acceso limitado (sin gestión de usuarios)

## 📱 Interfaz de Usuario

### Principios de Diseño
- **Estética Material Design** moderna y limpia
- **Diseño responsivo** para todos los tamaños de dispositivos
- **Navegación intuitiva** con menú lateral
- **Esquema de colores consistente** y tipografía clara
- **Elementos de diseño** enfocados en la accesibilidad

### Estructura de Navegación
- **Panel de Control**: Resumen y métricas clave
- **Productos**: Gestión del catálogo de productos
- **Inventario**: Gestión de niveles de stock
- **Transacciones**: Seguimiento de movimientos y transacciones inusuales
- **Reportes**: Análisis e insights
- **Usuarios**: Gestión de usuarios (Solo Admin)

## 🏗️ Arquitectura

### Estructura de Componentes
```
src/
├── components/          # Componentes UI reutilizables
│   └── NavigationSidebar.vue
├── views/              # Componentes de página
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── ProductsView.vue
│   ├── InventoryView.vue
│   ├── TransactionsView.vue
│   ├── ReportsView.vue
│   └── UsersView.vue
├── store/              # Stores de Pinia
│   ├── auth.js         # Estado de autenticación
│   ├── inventory.js    # Datos de inventario
│   ├── transactions.js # Gestión de transacciones
│   ├── product.js      # Gestión de productos
│   └── stores.js       # Gestión de tiendas
├── router/             # Configuración de Vue Router
│   └── index.js
└── main.js             # Punto de entrada de la aplicación
```

### Gestión de Estado
- **Auth Store**: Autenticación de usuario y gestión de sesión
- **Inventory Store**: Datos de productos, tiendas, inventario y transacciones
- **Transaction Store**: Lógica específica para transacciones y detección de anomalías

### Enrutamiento
- **Rutas protegidas** con guardias de autenticación
- **Control de acceso basado en roles** para páginas de solo administrador
- **Redirecciones automáticas** para usuarios no autenticados

## 🎨 Personalización

### Configuración de Tema
La aplicación utiliza el sistema de temas de Vuetify con colores personalizables:

```javascript
theme: {
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        primary: '#1976D2',    // Color principal de la marca
        secondary: '#424242',  // Elementos secundarios
        success: '#388E3C',    // Estados de éxito
        warning: '#F57C00',    // Estados de advertencia
        error: '#D32F2F',      // Estados de error
      },
    },
  },
}
```

## 📊 Estructura de Datos

### Modelo de Producto
```javascript
{
  id: Number,
  name: String,
  description: String,
  price: Number,
  sku: String,
  category: String
}
```

### Modelo de Inventario
```javascript
{
  id: Number,
  productId: Number,
  storeId: Number,
  quantity: Number,
  minStock: Number
}
```

### Modelo de Transacción
```javascript
{
  id: Number,
  type: 'Sale' | 'Transfer' | 'Receipt',
  date: String,
  productId: Number,
  quantity: Number,
  storeId: Number,
  amount: Number,        // Para ventas
  fromStoreId: Number,   // Para transferencias
  toStoreId: Number,     // Para transferencias
  supplier: String       // Para recepciones
}
```

## 🔒 Características de Seguridad

- **Protección de rutas** para usuarios autenticados
- **Control de acceso basado en roles**
- **Validación de entrada** en todos los formularios
- **Manejo seguro de contraseñas**
- **Gestión de sesiones** con localStorage

## 🤝 Contribución

1. Haz un Fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/NuevaFuncionalidad`)
3. Haz tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Haz Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Construido con ❤️ usando Vue 3 y Vuetify**
