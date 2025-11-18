# 🛒 Sistema de Pedidos y Pick-up - Vértice

## 📋 Resumen de Cambios

Este documento detalla la implementación completa del **Sistema de Pedidos y Puntos de Retiro (Pick-up)** en la plataforma Vértice, que conecta comerciantes con consumidores de forma eficiente y sostenible.

---

## 🎯 Funcionalidades Implementadas

### Para CONSUMIDORES:

#### 1. **Carrito de Compras**
- ✅ Visualización de productos agregados
- ✅ Modificación de cantidades
- ✅ Eliminación de productos individuales
- ✅ Cálculo automático de totales
- ✅ Persistencia del carrito en `localStorage`
- ✅ Validación: solo productos de un mismo comerciante por pedido

#### 2. **Finalización de Pedido**
- ✅ Selección de punto de retiro en mapa interactivo (Leaflet)
- ✅ Selector de horario de retiro (rangos de 2 horas)
- ✅ Confirmación del pedido con validaciones
- ✅ Limpieza automática del carrito tras confirmación

#### 3. **Gestión de Pedidos**
- ✅ Visualización de todos los pedidos realizados
- ✅ Filtrado por estado (Pendiente, Aceptado, Entregado, Rechazado)
- ✅ Información detallada del comerciante
- ✅ Verificación de entrega (cuando el estado es "Aceptado")

### Para COMERCIANTES:

#### 1. **Gestión de Pedidos**
- ✅ Visualización de pedidos en tabla responsive
- ✅ Información del cliente, productos, punto de retiro y horario
- ✅ Acciones disponibles según el estado:
  - **Pendiente**: Aceptar o Rechazar
  - **Aceptado**: Marcar como Entregado o Cancelar
- ✅ Filtros por estado (Pendiente, Aceptado, Entregado, Cancelado)

#### 2. **Puntos de Retiro**
- ✅ Visualización de puntos de retiro públicos fijos
- ✅ Mapa interactivo con ubicaciones

---

## 🗂️ Archivos Nuevos Creados

### Backend (`back-vertice/`)

#### Modelos
```
src/models/PuntoRetiroPublico.js
```
- Modelo para puntos de retiro públicos (Plaza San Martín, La Virgen, La Cruz)
- Campos: nombre, dirección, latitud, longitud, descripción, activo

#### Controladores Actualizados
```
src/controllers/pedidoController.js
```
**Funciones añadidas:**
- `getPedidosByConsumidor()` - Obtener pedidos del consumidor autenticado
- `aceptarPedido()` - Comerciante acepta un pedido
- `rechazarPedido()` - Comerciante rechaza un pedido
- `entregarPedido()` - Marcar pedido como entregado (actualiza stock)
- `getPuntosRetiroPublicos()` - Listar puntos de retiro disponibles

**Funciones modificadas:**
- `crearPedido()` - Validación mejorada de productos y stock
- `getPedidosByComerciante()` - Populate mejorado

#### Rutas Actualizadas
```
src/routes/pedidoRoutes.js
```
**Nuevas rutas:**
- `GET /api/pedidos/puntos-retiro` - Listar puntos de retiro (público)
- `GET /api/pedidos/consumidor` - Pedidos del consumidor
- `PUT /api/pedidos/aceptar/:id` - Aceptar pedido
- `PUT /api/pedidos/rechazar/:id` - Rechazar pedido
- `PUT /api/pedidos/entregar/:id` - Marcar como entregado

### Frontend (`front-vertice/`)

#### Nuevas Páginas HTML

1. **`consumidor.carrito.html`**
   - Página completa del carrito de compras
   - Diseño responsive con grid layout
   - Resumen de pedido con totales
   - Botones de acción (Finalizar, Vaciar, Seguir comprando)

2. **`consumidor.elegir-pickup.html`**
   - Selección de punto de retiro con mapa Leaflet
   - Lista de puntos con radio buttons
   - Selector de horario (6 franjas horarias)
   - Resumen del pedido
   - Validación antes de enviar

3. **`consumidor.mis-pedidos.html`**
   - Lista de pedidos del consumidor
   - Tarjetas con información completa
   - Filtros por estado
   - Información del comerciante con avatar
   - Botón para marcar como entregado

#### Nuevos Scripts JavaScript

1. **`js-vivi/carrito.js`**
   - Renderizado de items del carrito
   - Modificación de cantidades (+/-)
   - Eliminación de productos
   - Validación de comerciante único
   - Redirección a checkout

2. **`js-vivi/elegir-pickup.js`**
   - Inicialización de mapa Leaflet
   - Carga de puntos de retiro desde API
   - Selección interactiva de punto
   - Validación de formulario
   - Envío de pedido a la API
   - Limpieza del carrito tras éxito

3. **`js-vivi/mis-pedidos-consumidor.js`**
   - Carga de pedidos desde API
   - Renderizado de tarjetas de pedidos
   - Filtrado por estado
   - Función para marcar como entregado
   - Formato de fechas en español

4. **`js-vivi/comercio-pedidos.js` (Actualizado)**
   - Carga de pedidos del comerciante
   - Filtros por estado
   - Acciones: Aceptar, Rechazar, Entregar, Cancelar
   - Actualización dinámica de la tabla
   - Autenticación con JWT

#### Archivos Actualizados

**`vista-producto-user.html`**
- Añadido enlace "Mis Pedidos" en navegación
- Funcionalidad al botón del carrito (redirección)

---

## 🔌 API Endpoints

### Pedidos (Consumidor)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/pedidos/crear` | Crear un nuevo pedido | Consumidor |
| GET | `/api/pedidos/consumidor` | Listar pedidos del consumidor | Consumidor |
| PUT | `/api/pedidos/entregar/:id` | Marcar pedido como entregado | Consumidor/Comerciante |

### Pedidos (Comerciante)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/pedidos/comerciante` | Listar pedidos del comerciante | Comerciante |
| PUT | `/api/pedidos/aceptar/:id` | Aceptar un pedido | Comerciante |
| PUT | `/api/pedidos/rechazar/:id` | Rechazar un pedido | Comerciante |
| PUT | `/api/pedidos/cancelar/:id` | Cancelar un pedido | Comerciante |

### Puntos de Retiro

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/pedidos/puntos-retiro` | Listar puntos de retiro públicos | Público |

---

## 📊 Modelo de Datos

### Pedido (Actualizado)

```javascript
{
  consumidorId: ObjectId,           // Referencia a User (consumidor)
  comercianteId: ObjectId,          // Referencia a User (comerciante)
  productos: [{
    productoId: ObjectId,           // Referencia a Producto
    cantidad: Number,
    precioEnElMomento: Number       // Precio al momento de la compra
  }],
  puntoDeRetiro: String,            // Nombre del punto de retiro
  horarioRetiro: String,            // Ej: "09:00-11:00"
  totalVenta: Number,
  estado: String,                    // 'pendiente', 'aceptado', 'rechazado', 
                                     // 'entregado', 'cancelado'
  createdAt: Date,
  updatedAt: Date
}
```

### PuntoRetiroPublico (Nuevo)

```javascript
{
  nombre: String,                    // Ej: "Plaza San Martín"
  direccion: String,
  latitud: Number,
  longitud: Number,
  descripcion: String,
  activo: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Verde Principal**: `#4cd309` (Vértice)
- **Verde Hover**: `#3da307`
- **Gris Oscuro**: `#2c3e50`
- **Gris Claro**: `#f8f9fa`
- **Rojo (Rechazado)**: `#e74c3c`
- **Amarillo (Pendiente)**: `#f39c12`
- **Azul (Aceptado)**: `#3498db`

### Características de Diseño
- ✅ Diseño responsive (mobile-first)
- ✅ Grid layout moderno
- ✅ Animaciones suaves (transform, transitions)
- ✅ Iconos Font Awesome
- ✅ Tipografía: Montserrat (cuerpo) y Sulphur Point (títulos)
- ✅ Sombras sutiles para profundidad
- ✅ Estados visuales claros (badges de color)

---

## 🔐 Seguridad y Validaciones

### Backend
- ✅ Autenticación JWT en todas las rutas protegidas
- ✅ Validación de roles (consumidor/comerciante)
- ✅ Verificación de propiedad de pedidos
- ✅ Validación de stock disponible
- ✅ Validación de productos del mismo comerciante
- ✅ Protección contra modificaciones no autorizadas

### Frontend
- ✅ Validación de formularios
- ✅ Confirmación de acciones destructivas
- ✅ Redirección si no hay autenticación
- ✅ Mensajes de error descriptivos
- ✅ Validación de carrito vacío

---

## 🚀 Flujo Completo del Sistema

### 1. Consumidor Agrega Productos
```
vista-producto-user.html → Clic "Agregar al Carrito"
↓
cart-persistence.js → Guarda en localStorage
↓
Actualiza contador del carrito en header
```

### 2. Consumidor Finaliza Pedido
```
consumidor.carrito.html → Clic "Finalizar Pedido"
↓
consumidor.elegir-pickup.html → Selecciona punto y horario
↓
elegir-pickup.js → POST /api/pedidos/crear
↓
Backend valida y crea pedido con estado "pendiente"
↓
Redirige a consumidor.mis-pedidos.html
```

### 3. Comerciante Gestiona Pedido
```
comercio-pedido.html → Lista pedidos pendientes
↓
Clic "Aceptar" → PUT /api/pedidos/aceptar/:id
↓
Estado cambia a "aceptado"
↓
Clic "Marcar como Entregado" → PUT /api/pedidos/entregar/:id
↓
Estado cambia a "entregado" + Se actualiza stock
```

### 4. Consumidor Verifica Entrega
```
consumidor.mis-pedidos.html → Ve estado "aceptado"
↓
Clic "Marcar como Entregado" (opcional)
↓
PUT /api/pedidos/entregar/:id
↓
Estado cambia a "entregado"
```

---

## 📦 Dependencias Utilizadas

### Backend
- `express` - Framework web
- `mongoose` - ODM para MongoDB
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `cors` - CORS middleware
- `cookie-parser` - Manejo de cookies

### Frontend
- `Leaflet` - Mapas interactivos
- `Font Awesome` - Iconos
- `localStorage` - Persistencia del carrito

---

## ⚙️ Configuración Inicial

### 1. Crear Puntos de Retiro Públicos

Ejecuta este script en MongoDB o crea una función de seed:

```javascript
// Insertar puntos de retiro en la base de datos
db.puntoretirpublicos.insertMany([
  {
    nombre: "Plaza San Martín",
    direccion: "Av. 25 de Mayo y Brandsen, Formosa",
    latitud: -26.1842,
    longitud: -58.1731,
    descripcion: "Punto de retiro en la plaza principal",
    activo: true
  },
  {
    nombre: "La Virgen",
    direccion: "Barrio La Virgen, Formosa",
    latitud: -26.1900,
    longitud: -58.1650,
    descripcion: "Punto de retiro en el barrio",
    activo: true
  },
  {
    nombre: "La Cruz",
    direccion: "Barrio La Cruz, Formosa",
    latitud: -26.1750,
    longitud: -58.1800,
    descripcion: "Punto de retiro cercano al barrio",
    activo: true
  }
]);
```

### 2. Variables de Entorno

Asegúrate de tener en tu `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vertice
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRE=7d
```

---

## 🧪 Pruebas Sugeridas

### Flujo de Consumidor
1. ✅ Agregar productos de diferentes comerciantes (debe alertar)
2. ✅ Agregar productos del mismo comerciante
3. ✅ Modificar cantidades en el carrito
4. ✅ Vaciar el carrito
5. ✅ Finalizar pedido sin seleccionar pickup (debe validar)
6. ✅ Finalizar pedido completo
7. ✅ Ver pedidos en "Mis Pedidos"
8. ✅ Marcar como entregado

### Flujo de Comerciante
1. ✅ Ver pedidos pendientes
2. ✅ Aceptar un pedido
3. ✅ Rechazar un pedido
4. ✅ Marcar como entregado (verificar actualización de stock)
5. ✅ Cancelar un pedido aceptado
6. ✅ Filtrar por diferentes estados

---

## 🐛 Problemas Conocidos y Soluciones

### 1. PayloadTooLargeError
**Solución aplicada:** Aumentado el límite de `express.json()` a 10MB en `app.js`

### 2. Carrito no persiste entre páginas
**Solución aplicada:** Implementado `cart-persistence.js` con `localStorage` y eventos personalizados

### 3. Mapa no carga
**Verificar:** 
- Librería Leaflet incluida
- Coordenadas correctas
- Altura definida para `#map`

---

## 📈 Mejoras Futuras Sugeridas

### Corto Plazo
- [ ] Notificaciones push/email cuando cambia el estado del pedido
- [ ] Historial de pedidos con paginación
- [ ] Búsqueda y filtros avanzados en pedidos
- [ ] Exportar pedidos a PDF/Excel

### Mediano Plazo
- [ ] Sistema de calificaciones y reseñas
- [ ] Chat entre consumidor y comerciante
- [ ] Múltiples puntos de retiro por comerciante
- [ ] Horarios dinámicos según disponibilidad

### Largo Plazo
- [ ] Integración con pasarelas de pago
- [ ] Sistema de cupones y descuentos
- [ ] Programa de fidelización
- [ ] App móvil nativa

---

## 👥 Roles y Permisos

| Acción | Consumidor | Comerciante | Admin |
|--------|------------|-------------|-------|
| Agregar al carrito | ✅ | ❌ | ❌ |
| Crear pedido | ✅ | ❌ | ❌ |
| Ver sus pedidos | ✅ | ❌ | ✅ |
| Aceptar/Rechazar pedido | ❌ | ✅ | ✅ |
| Marcar como entregado | ✅* | ✅ | ✅ |
| Ver puntos de retiro | ✅ | ✅ | ✅ |

*Solo para sus propios pedidos en estado "aceptado"

---

## 📝 Notas Importantes

1. **Límite de body-parser:** Se aumentó a 10MB para soportar imágenes en base64
2. **Puntos de retiro:** Son públicos y fijos (no pertenecen a un comerciante específico)
3. **Stock:** Se actualiza automáticamente cuando un pedido se marca como "entregado"
4. **Carrito:** Solo permite productos de un mismo comerciante a la vez
5. **Estados de pedido:** 
   - `pendiente` → El consumidor creó el pedido
   - `aceptado` → El comerciante aceptó el pedido
   - `rechazado` → El comerciante rechazó el pedido
   - `entregado` → El pedido fue entregado y el stock actualizado
   - `cancelado` → El comerciante canceló un pedido ya aceptado

---

## 📞 Soporte

Para cualquier duda o problema, contacta al equipo de desarrollo.

**Fecha de implementación:** Noviembre 2025  
**Versión:** 1.0.0  
**Desarrollado para:** Proyecto Vértice - Plataforma de Comercio Sostenible

---

## ✅ Checklist de Implementación Completada

- [x] Modelos de backend actualizados
- [x] Controladores extendidos con nuevas funciones
- [x] Rutas de API configuradas
- [x] Página de carrito creada
- [x] Página de selección de pickup creada
- [x] Página de mis pedidos creada
- [x] JavaScript del carrito implementado
- [x] JavaScript de pedidos implementado
- [x] Navegación actualizada
- [x] Integración completa frontend-backend
- [x] Validaciones y seguridad aplicadas
- [x] Diseño responsive implementado
- [x] README documentado

---

**¡Sistema de Pedidos y Pick-up completamente funcional! 🎉**
