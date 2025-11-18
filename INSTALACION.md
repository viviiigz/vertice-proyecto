# 🚀 Guía de Instalación y Configuración Rápida

## Prerequisitos
- Node.js v16 o superior
- MongoDB v5 o superior
- Git

---

## 📥 Instalación

### 1. Clonar el repositorio (si aplica)
```bash
git clone https://github.com/viviiigz/vertice-proyecto.git
cd vertice-proyecto
```

### 2. Instalar dependencias del backend
```bash
cd back-vertice
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la carpeta `back-vertice`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vertice
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@vertice.com
ADMIN_PASS=admin123
ADMIN_USERNAME=admin
```

### 4. Iniciar MongoDB
```bash
# Windows (si instalaste MongoDB como servicio)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. Crear puntos de retiro iniciales
```bash
cd back-vertice
node scripts/create-pickup-points.js
```

### 6. Iniciar el servidor backend
```bash
# Modo desarrollo con recarga automática
npm start

# O modo producción
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

---

## 🌐 Configuración del Frontend

### 1. Servir archivos estáticos

El backend ya está configurado para servir el frontend. Los archivos HTML se sirven automáticamente desde:
- `http://localhost:3000/` (archivos de `front-vertice/`)

### 2. Abrir la aplicación

**Para Consumidores:**
- Página principal: `http://localhost:3000/usuario.tienda.html`
- Productos: `http://localhost:3000/vista-producto-user.html`
- Login: `http://localhost:3000/login.html`

**Para Comerciantes:**
- Dashboard: `http://localhost:3000/comercio.estadisticas.html`
- Productos: `http://localhost:3000/comercio.producto.html`
- Pedidos: `http://localhost:3000/comercio-pedido.html`

---

## 👤 Usuarios de Prueba

### Crear un Consumidor
1. Ve a `http://localhost:3000/registro.html`
2. Selecciona rol "Consumidor"
3. Completa el formulario y registra

### Crear un Comerciante
1. Ve a `http://localhost:3000/registro.html`
2. Selecciona rol "Comercio"
3. Completa el formulario y registra
4. **Importante:** El comerciante debe ser aprobado por un administrador antes de poder publicar productos

### Usuario Administrador (Auto-creado)
- **Email:** `admin@vertice.com` (configurable en `.env`)
- **Password:** `admin123` (configurable en `.env`)
- **Rol:** admin

---

## 🧪 Probar el Sistema de Pedidos

### Flujo Completo de Prueba

#### 1. Como Comerciante
```
1. Login como comerciante
2. Ir a "Productos" → Crear un producto nuevo
3. Asignar precio y stock
4. Guardar producto
```

#### 2. Como Consumidor
```
1. Login/Registro como consumidor
2. Ir a "Productos"
3. Buscar productos del comerciante
4. Clic en "Agregar al carrito" (varios productos)
5. Clic en el icono del carrito en el header
6. Verificar productos en el carrito
7. Clic en "Finalizar Pedido"
8. Seleccionar un punto de retiro en el mapa
9. Seleccionar un horario
10. Clic en "Realizar Pedido"
11. Ir a "Mis Pedidos" para ver el estado
```

#### 3. Como Comerciante (Gestión)
```
1. Ir a "Pedidos"
2. Ver el pedido pendiente
3. Clic en "Aceptar" (botón verde)
4. El estado cambia a "Aceptado"
5. (Cuando el consumidor retira) Clic en "Marcar como Entregado"
6. Verificar que el stock se actualizó
```

---

## 🛠️ Comandos Útiles

### Backend

```bash
# Iniciar en modo desarrollo (con recarga automática)
npm start

# Iniciar en modo normal
npm run dev

# Crear usuario administrador manualmente
node scripts/create-admin.js

# Crear puntos de retiro
node scripts/create-pickup-points.js
```

### Base de Datos

```bash
# Conectar a MongoDB Shell
mongosh

# Ver bases de datos
show dbs

# Usar la base de datos de Vértice
use vertice

# Ver colecciones
show collections

# Ver puntos de retiro
db.puntoretirpublicos.find().pretty()

# Ver pedidos
db.pedidos.find().pretty()

# Limpiar todos los pedidos (CUIDADO)
db.pedidos.deleteMany({})
```

---

## 📝 Verificación de Instalación

### Checklist
- [ ] MongoDB está corriendo
- [ ] Backend inició sin errores en puerto 3000
- [ ] Se crearon los puntos de retiro (3 puntos)
- [ ] Usuario admin fue creado automáticamente
- [ ] Frontend es accesible desde el navegador
- [ ] Puedes registrar un nuevo usuario
- [ ] Puedes hacer login
- [ ] El carrito funciona y persiste al recargar

---

## 🐛 Solución de Problemas Comunes

### Error: "ECONNREFUSED - MongoDB"
**Solución:** Asegúrate de que MongoDB esté corriendo
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Error: "Puerto 3000 ya está en uso"
**Solución:** 
1. Cambia el puerto en `.env`: `PORT=3001`
2. O mata el proceso que usa el puerto 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número_de_proceso] /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### Error: "Cannot GET /"
**Solución:** Navega a una página específica como `/usuario.tienda.html` o `/vista-producto-user.html`

### El carrito no guarda productos
**Solución:** 
1. Verifica que `localStorage` esté habilitado en tu navegador
2. Verifica en DevTools → Application → Local Storage
3. Limpia el localStorage: `localStorage.clear()` en la consola

### Los puntos de retiro no aparecen en el mapa
**Solución:**
1. Ejecuta el script: `node scripts/create-pickup-points.js`
2. Verifica en MongoDB: `db.puntoretirpublicos.find()`
3. Verifica que el endpoint responda: `http://localhost:3000/api/pedidos/puntos-retiro`

---

## 📊 Monitoreo y Logs

### Ver logs del servidor
Los logs aparecen en la consola donde ejecutaste `npm start`

### Logs importantes:
- ✅ "Servidor corriendo en el puerto 3000"
- ✅ "Conectado a MongoDB"
- ❌ "Error de conexión a la base de datos"
- ⚠️ "PayloadTooLargeError" → Ya solucionado con límite de 10MB

---

## 🔒 Seguridad en Producción

### Antes de desplegar a producción:

1. **Cambiar credenciales:**
   ```env
   JWT_SECRET=una_clave_super_segura_y_larga_cambiar_esto
   ADMIN_PASS=password_seguro_del_admin
   ```

2. **Configurar CORS apropiadamente:**
   - Editar `back-vertice/app.js`
   - Cambiar `allowedOrigins` a tus dominios de producción

3. **Usar HTTPS:**
   - Configura un certificado SSL
   - Redirige todo el tráfico HTTP a HTTPS

4. **Variables de entorno seguras:**
   - Nunca subas `.env` a Git
   - Usa servicios como Heroku Config Vars o AWS Secrets Manager

5. **Rate limiting:**
   - Considera agregar `express-rate-limit` para prevenir abuso

---

## 📞 Contacto y Soporte

Si encuentras algún problema durante la instalación:

1. Revisa este documento completo
2. Verifica los logs del servidor
3. Consulta el README principal: `README-PEDIDOS.md`
4. Revisa los errores en la consola del navegador (F12)

---

## ✅ Siguiente Paso

Una vez que todo esté funcionando, revisa el **README-PEDIDOS.md** para entender:
- La arquitectura completa
- Los endpoints de la API
- El flujo de datos
- Las mejoras futuras sugeridas

**¡Listo para comenzar! 🎉**
