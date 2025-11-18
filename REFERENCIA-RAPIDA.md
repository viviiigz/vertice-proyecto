# 🚀 Referencia Rápida - Sistema de Pedidos Vértice

## 📁 Archivos Nuevos - Vista Rápida

### Backend
```
src/models/PuntoRetiroPublico.js          → Modelo de puntos de retiro
src/controllers/pedidoController.js       → Funciones: aceptar, rechazar, entregar
scripts/create-pickup-points.js           → Script de inicialización
```

### Frontend
```
consumidor.carrito.html                   → Página del carrito
consumidor.elegir-pickup.html             → Selección de punto/horario
consumidor.mis-pedidos.html               → Lista de pedidos del consumidor
js-vivi/carrito.js                        → Lógica del carrito
js-vivi/elegir-pickup.js                  → Lógica de finalizar pedido
js-vivi/mis-pedidos-consumidor.js         → Lógica de ver pedidos
js-vivi/comercio-pedidos.js               → Gestión de pedidos (actualizado)
```

---

## 🔗 URLs Importantes

### Consumidor
```
/usuario.tienda.html                      → Inicio
/vista-producto-user.html                 → Ver productos
/consumidor.carrito.html                  → Carrito
/consumidor.elegir-pickup.html            → Checkout
/consumidor.mis-pedidos.html              → Mis pedidos
```

### Comerciante
```
/comercio.estadisticas.html               → Dashboard
/comercio.producto.html                   → Mis productos
/comercio-pedido.html                     → Gestión de pedidos
/comercio-pickup.html                     → Puntos de retiro
```

---

## 🔌 API Endpoints

### Pedidos
```http
POST   /api/pedidos/crear                 → Crear pedido (Consumidor)
GET    /api/pedidos/consumidor            → Mis pedidos (Consumidor)
GET    /api/pedidos/comerciante           → Pedidos recibidos (Comerciante)
PUT    /api/pedidos/aceptar/:id           → Aceptar (Comerciante)
PUT    /api/pedidos/rechazar/:id          → Rechazar (Comerciante)
PUT    /api/pedidos/cancelar/:id          → Cancelar (Comerciante)
PUT    /api/pedidos/entregar/:id          → Entregar (Ambos)
GET    /api/pedidos/puntos-retiro         → Puntos públicos (Público)
```

---

## ⚡ Comandos Esenciales

### Iniciar proyecto
```bash
cd back-vertice
npm install
node scripts/create-pickup-points.js
npm start
```

### Abrir en navegador
```
http://localhost:3000/usuario.tienda.html
```

---

## 🎯 Estados de Pedido

```
pendiente   → Pedido creado, esperando respuesta del comerciante
aceptado    → Comerciante aceptó, listo para retiro
rechazado   → Comerciante rechazó el pedido
entregado   → Pedido completado y stock actualizado
cancelado   → Comerciante canceló pedido ya aceptado
```

---

## 🗺️ Puntos de Retiro

```javascript
Plaza San Martín    → (-26.1842, -58.1731)
La Virgen           → (-26.1900, -58.1650)
La Cruz             → (-26.1750, -58.1800)
```

---

## 🔑 Variables .env Necesarias

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vertice
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@vertice.com
ADMIN_PASS=admin123
```

---

## 🧪 Test Rápido (5 min)

### Como Consumidor
```
1. Login/Registro
2. Ir a Productos
3. Agregar 2-3 productos al carrito
4. Clic en icono carrito → Ver carrito
5. Finalizar Pedido
6. Seleccionar punto y horario
7. Confirmar → Ir a "Mis Pedidos"
```

### Como Comerciante
```
1. Login como comerciante
2. Ir a "Pedidos"
3. Ver pedido pendiente
4. Clic "Aceptar" (✓)
5. Ver cambio de estado
6. Clic "Marcar como Entregado"
7. Verificar stock actualizado
```

---

## 🐛 Troubleshooting Express

| Error | Solución |
|-------|----------|
| MongoDB no conecta | `net start MongoDB` (Windows) |
| Puerto en uso | Cambiar PORT en .env |
| Carrito vacío | Verificar localStorage en DevTools |
| Puntos no aparecen | `node scripts/create-pickup-points.js` |
| PayloadTooLarge | Ya resuelto (10MB limit) |

---

## 📊 Estructura de Datos

### Pedido
```javascript
{
  consumidorId: ObjectId,
  comercianteId: ObjectId,
  productos: [{ productoId, cantidad, precioEnElMomento }],
  puntoDeRetiro: "Plaza San Martín",
  horarioRetiro: "09:00-11:00",
  totalVenta: 1250.50,
  estado: "pendiente"
}
```

### Carrito (localStorage)
```javascript
{
  items: [
    { id, nombre, precio, imagen, quantity }
  ],
  count: 3
}
```

---

## 🎨 Colores Vértice

```css
Verde principal:  #4cd309
Verde hover:      #3da307
Gris oscuro:      #2c3e50
Gris claro:       #f8f9fa
```

---

## 📱 Responsive Breakpoints

```css
Mobile:    < 768px
Tablet:    768px - 991px
Desktop:   ≥ 992px
```

---

## 🔒 Middlewares Usados

```javascript
authMiddleware       → Verifica JWT token
authRole(['rol'])    → Verifica rol específico
express.json()       → Parse JSON (limit: 10mb)
```

---

## 📚 Documentación Completa

- **Setup:** `INSTALACION.md`
- **Detalles técnicos:** `README-PEDIDOS.md`
- **Resumen:** `RESUMEN-CAMBIOS.md`
- **Referencia rápida:** Este archivo

---

## ✅ Checklist Pre-Deploy

- [ ] Cambiar JWT_SECRET
- [ ] Cambiar ADMIN_PASS
- [ ] Configurar CORS para producción
- [ ] Habilitar HTTPS
- [ ] Backup de base de datos
- [ ] Test completo de flujos
- [ ] Monitoreo de logs

---

## 💡 Tips de Desarrollo

1. **DevTools es tu amigo:** F12 → Console para ver errores
2. **Network tab:** Verifica requests a la API
3. **Application tab:** Inspecciona localStorage
4. **MongoDB Compass:** GUI para ver la base de datos
5. **Postman:** Testea endpoints directamente

---

## 🎓 Conceptos Clave

- **localStorage:** Persistencia del carrito entre páginas
- **JWT:** Autenticación sin estado
- **Leaflet:** Biblioteca de mapas open-source
- **Populate:** Mongoose join de colecciones
- **Middleware:** Funciones que procesan requests antes del controlador

---

## 🚀 Performance Tips

- Carrito usa localStorage (no consulta servidor)
- Puntos de retiro se cachean en el cliente
- Populate solo trae campos necesarios
- Índices en MongoDB para IDs

---

**Última actualización:** Noviembre 2025  
**Para más info:** Ver documentación completa en `README-PEDIDOS.md`
