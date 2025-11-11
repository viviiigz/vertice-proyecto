# 🔧 GUÍA DE CORRECCIÓN - ERRORES DE COMERCIANTE Y ADMIN

## ✅ Cambios Realizados

### 1. **Mejoras en el Frontend de Productos (logica-tienda.js)**

#### Problema Original:
- Timeout de redirección muy corto (150ms)
- Errores no visibles por auto-reload
- Falta de logs detallados

#### Soluciones Implementadas:
- ✅ Aumentado timeout de redirección a 1500ms
- ✅ Agregado mensaje de éxito visual antes de redirigir
- ✅ Mejorado manejo de errores para evitar auto-reload
- ✅ Logs detallados con emojis para mejor debugging
- ✅ Stack trace completo en errores
- ✅ Validación de FormData con logs de cada campo

#### Código Mejorado:
```javascript
// En crearProducto():
- Logs detallados de token
- Logs de cada entrada del FormData
- Mejor manejo de errores del servidor
- Stack trace completo

// En guardarProducto():
- Mensaje de éxito visible (1500ms antes de redirect)
- Sin redirect en caso de error
- Mejor identificación de errores de autenticación
```

### 2. **Mejoras en el Panel de Admin (vista-adminVERTICE.html)**

#### Problema Original:
- Solicitudes de bancos no visibles
- Sin logs de debugging
- Errores silenciosos

#### Soluciones Implementadas:
- ✅ Logs detallados en cada paso del fetch
- ✅ Verificación de headers enviados
- ✅ Mejor manejo de errores 401/403/503
- ✅ Mensajes específicos para cada tipo de error
- ✅ Contador de solicitudes encontradas

#### Código Mejorado:
```javascript
// En fetchSolicitudes():
- Log de headers enviados
- Log de status de respuesta
- Log de datos recibidos
- Manejo específico de cada error HTTP
- Mejor feedback al usuario
```

### 3. **Herramienta de Testing Creada**

Nuevo archivo: `front-vertice/test-admin.html`

#### Funcionalidades:
- ✅ Test de conexión al backend (ping)
- ✅ Test de solicitudes sin auth (debug endpoint)
- ✅ Test de datos mock
- ✅ Test de solicitudes con auth
- ✅ Verificación de bancos en DB
- ✅ Verificación de token en localStorage

---

## 🧪 PASOS PARA DEBUGGING

### Paso 1: Verificar el Backend está corriendo

```powershell
cd "c:\Users\Ana\Desktop\proyects mine\vertice-proyecto\back-vertice"
npm start
```

Deberías ver:
```
Servidor Express corriendo en puerto 3000
MongoDB conectado
```

### Paso 2: Abrir la herramienta de test

1. Abre en tu navegador: `front-vertice/test-admin.html`
2. Ejecuta los tests en orden:
   - **Test Ping** → Verifica que el backend responde
   - **Debug Solicitudes** → Verifica si hay bancos pendientes en DB
   - **Mock Data** → Verifica que el endpoint mock funciona
   - **Con Auth** → Verifica tu token de admin
   - **Verificar Bancos** → Ve todos los bancos registrados

### Paso 3: Revisar la consola del navegador

Abre las **DevTools** (F12) y ve a la pestaña **Console**. Los nuevos logs mostrarán:

#### Para creación de productos:
```
🔐 Token en localStorage: Existe ✅
📤 Haciendo POST a: http://localhost:3000/api/productos
📦 FormData entries:
  nombre_producto: Tomate
  descripcion: Descripción...
  foto: imagen.jpg (52341 bytes)
📥 Respuesta del servidor - Status: 201 OK
✅ Respuesta exitosa: {...}
```

#### Para solicitudes de admin:
```
🔍 Obteniendo solicitudes del admin panel...
🔐 Headers enviados: {Authorization: "Bearer eyJ..."}
📥 Respuesta recibida - Status: 200 OK
✅ Datos recibidos: {success: true, solicitudes: [...]}
✅ 3 solicitudes pendientes encontradas
```

### Paso 4: Probar crear un producto como comerciante

1. Inicia sesión como comerciante (no banco)
2. Ve a `comercio.nuevo-producto.html`
3. Llena el formulario completo
4. Abre la consola (F12)
5. Haz clic en "Guardar Producto"
6. **NO CIERRES LA CONSOLA** - deberías ver todos los logs

#### Si hay error:
- El mensaje aparecerá en la esquina superior derecha
- La página NO se recargará automáticamente
- La consola mostrará el error completo con stack trace
- El botón se re-habilitará para reintentar

#### Si es exitoso:
- Verás mensaje verde: "¡Producto '[nombre]' guardado correctamente!"
- Esperará 1.5 segundos
- Te redirigirá a `comercio.producto.html`

### Paso 5: Probar el panel de admin

1. Asegúrate de estar logueado como admin
2. Ve a `vista-adminVERTICE.html`
3. Abre la consola (F12)
4. Recarga la página
5. Verás los logs detallados:
   - Si hay solicitudes: "✅ X solicitudes pendientes encontradas"
   - Si no hay: "ℹ️ No hay solicitudes pendientes"
   - Si hay error: Descripción específica del error

---

## 🐛 SOLUCIÓN A ERRORES COMUNES

### Error: "error al cargar producto"

**Posibles causas:**
1. **Token inválido o expirado**
   - Cierra sesión y vuelve a iniciar
   - Verifica en consola: "🔐 Token en localStorage: Existe ✅"

2. **Campos faltantes en el formulario**
   - Verifica en consola los "📦 FormData entries"
   - Asegúrate de llenar todos los campos requeridos

3. **Imagen muy grande**
   - Límite: 5MB
   - Verifica el tamaño en logs: "(XXXXX bytes)"

4. **Backend no corriendo**
   - Usa test-admin.html → Test Ping
   - Debe responder: {ok: true, msg: "admin routes loaded"}

### Error: "Solicitudes no aparecen en admin"

**Posibles causas:**
1. **No hay bancos registrados pendientes**
   - Usa test-admin.html → "Verificar Bancos en DB"
   - Si muestra 0 pendientes: regístralo manualmente

2. **No estás logueado como admin**
   - Verifica en consola: "🚫 No autorizado - Status: 401"
   - Inicia sesión con credenciales de admin

3. **Base de datos no conectada**
   - Verifica logs del backend
   - Debe mostrar: "MongoDB conectado"

4. **Token inválido**
   - En test-admin.html verifica "Token guardado"
   - Si está rojo: vuelve a iniciar sesión

---

## 📋 CHECKLIST DE VERIFICACIÓN

### Backend:
- [ ] Servidor corriendo en puerto 3000
- [ ] MongoDB conectado
- [ ] No hay errores en terminal del backend
- [ ] Endpoint /api/admin/_ping responde OK

### Frontend (Productos):
- [ ] Token en localStorage existe
- [ ] Todos los campos del formulario llenos
- [ ] Imagen seleccionada (opcional pero recomendado)
- [ ] Consola del navegador abierta
- [ ] Logs muestran FormData correctamente

### Frontend (Admin):
- [ ] Logueado como admin (role: 'admin')
- [ ] Token válido en localStorage
- [ ] Consola muestra logs de fetch
- [ ] Backend responde 200 OK
- [ ] Hay al menos un banco con estadoVerificacion: 'pendiente'

---

## 🚀 CÓMO REGISTRAR UN BANCO DE PRUEBA

Si no hay solicitudes pendientes:

1. Ve a `registro.html`
2. Llena el formulario:
   - Username: banco-test-1
   - Email: banco1@test.com
   - Password: 12345678
   - **Role: Banco de Alimentos**
   - Adjunta un PDF (opcional)
3. Registra
4. Deberías ver mensaje: "PENDIENTE APROBACIÓN"
5. Ve al panel de admin
6. Deberías ver la solicitud

---

## 📞 SI SIGUEN LOS ERRORES

1. **Copia todos los logs de la consola**
2. **Ejecuta todos los tests en test-admin.html**
3. **Toma screenshots de los errores**
4. **Verifica los logs del backend en la terminal**

Los logs ahora son mucho más descriptivos y te dirán exactamente qué está fallando.

---

## ⚠️ IMPORTANTE

**✅ NO SE TOCÓ EL BACKEND DE CONSUMIDORES**

Todos los cambios fueron:
- En `logica-tienda.js` (solo funciones de comerciante)
- En `vista-adminVERTICE.html` (solo panel de admin)
- Nuevo archivo `test-admin.html` (herramienta de prueba)

**Los filtros de productos para consumidores NO fueron modificados:**
- Escenario A: página principal (OR en categorias)
- Escenario B: páginas de categoría (exclusión de para-donar)

Todo el código del carrito, headers, y filtrado de consumidores permanece intacto.
