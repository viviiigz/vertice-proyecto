# Guía de Prueba - Sistema de Perfil de Usuario

## 🚀 Pasos para Probar

### 1. Iniciar el Servidor Backend
```powershell
cd back-vertice
npm run dev
```

**Verifica que aparezcan estos mensajes:**
```
MongoDB conectado correctamente: localhost
Servidor corriendo en el puerto 3000
```

### 2. Abrir la Consola del Navegador
1. Abre Chrome/Firefox
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña **Console**

### 3. Iniciar Sesión
1. Ve a `http://localhost:3000/login.html`
2. Inicia sesión con un usuario existente (comercio, consumidor o banco)
3. **Verifica en la consola** que aparezca el mensaje:
   ```
   Login exitoso (o similar)
   ```

### 4. Ir a la Página de Perfil
**Para comercios:**
```
http://localhost:3000/profile.comercio.html
```

**Para consumidores:**
```
http://localhost:3000/profile.consumidor.html
```

### 5. Verificar la Conexión (Consola del Navegador)
Deberías ver estos mensajes en la consola:
```
✅ perfil.js cargado correctamente
🔄 Cargando perfil...
✅ Token encontrado: eyJhbGciOiJIUzI1NiIsIn...
📡 Respuesta del servidor: 200
✅ Datos recibidos: {success: true, user: {...}}
```

### 6. Verificar que los Campos se Llenen Automáticamente
- ✅ **Nombre de usuario**: Debe aparecer en el header
- ✅ **Email**: Debe aparecer (solo lectura)
- ✅ **Descripción/Slogan**: Debe cargarse si ya existe
- ✅ **Teléfono**: Debe cargarse si ya existe
- ✅ **Dirección** (solo comercios): Debe cargarse si ya existe
- ✅ **Horarios** (solo comercios): Debe cargarse si ya existe

### 7. Editar y Guardar
1. Haz clic en el botón **"Guardar Cambios"** (o "Editar" según el diseño)
2. Modifica los campos editables:
   - Descripción
   - Teléfono (formato: +54 9 11 1234-5678)
   - Dirección (solo comercios)
   - Horarios (solo comercios)
3. Haz clic en **"Guardar Cambios"**
4. **Verifica en la consola**:
   ```
   Enviando datos al backend: {...}
   Perfil actualizado correctamente
   ```

### 8. Recargar la Página
1. Presiona `F5` para recargar
2. Verifica que los cambios se hayan guardado (los campos deben mantener los valores nuevos)

---

## 🐛 Problemas Comunes

### ❌ Error: "Sin autenticación"
**Causa:** No has iniciado sesión o el token expiró
**Solución:** Ve a `/login.html` e inicia sesión nuevamente

### ❌ Error 401: "Token inválido"
**Causa:** El token en localStorage es inválido
**Solución:** 
1. Abre la consola (F12)
2. Escribe: `localStorage.removeItem('token')`
3. Presiona Enter
4. Vuelve a iniciar sesión

### ❌ Error 503: "DB_NOT_CONNECTED"
**Causa:** MongoDB no está conectado
**Solución:** Verifica que MongoDB esté corriendo

### ❌ No se cargan los datos
**Causa:** El backend no está corriendo o hay error en la ruta
**Solución:**
1. Verifica que `npm run dev` esté corriendo sin errores
2. Abre `http://localhost:3000/api/perfil` en el navegador
3. Deberías ver JSON con error 401 (es normal, significa que la ruta funciona)

### ❌ Los cambios no se guardan
**Verifica en la consola del navegador:**
1. ¿Aparece "Enviando datos al backend"?
2. ¿Qué respuesta da el servidor?
3. ¿Hay algún error 400 o 500?

---

## 🔍 Verificar en MongoDB
Para ver si los datos realmente se guardaron:

1. Abre MongoDB Compass o Mongo Shell
2. Conecta a tu base de datos
3. Busca la colección `users`
4. Busca tu usuario por email
5. Verifica que tengan los campos:
   ```json
   {
     "descripcion": "...",
     "telefono": "+54 9 11 1234-5678",
     "direccion": "...",
     "horarios": "..."
   }
   ```

---

## 📝 Endpoints API Disponibles

### GET /api/perfil
**Requiere:** Token JWT (Authorization header o cookie)
**Respuesta:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "role": "comercio",
    "descripcion": "...",
    "telefono": "...",
    "direccion": "...",
    "horarios": "..."
  }
}
```

### PUT /api/perfil
**Requiere:** Token JWT
**Body:**
```json
{
  "descripcion": "Mi nueva descripción",
  "telefono": "+54 9 11 1234-5678",
  "direccion": "Calle 123",
  "horarios": "Lun-Vie 9-18"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente",
  "user": {...}
}
```

---

## ✅ Checklist Final

- [ ] Servidor backend corriendo sin errores
- [ ] MongoDB conectado
- [ ] Usuario logueado (token en localStorage)
- [ ] Página de perfil cargada
- [ ] Consola muestra "✅ perfil.js cargado correctamente"
- [ ] Consola muestra "✅ Datos recibidos"
- [ ] Campos del formulario se llenan automáticamente
- [ ] Al guardar cambios, consola muestra "Perfil actualizado correctamente"
- [ ] Al recargar, los cambios persisten
