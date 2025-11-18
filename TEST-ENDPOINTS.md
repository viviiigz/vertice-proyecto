# 🧪 TEST DE ENDPOINTS - DIAGNÓSTICO

## 🎯 Instrucciones

Sigue estos pasos **EXACTAMENTE** para diagnosticar el problema:

---

## ✅ PASO 1: Verifica que el servidor está corriendo

1. Abre una terminal en `back-vertice`
2. Ejecuta: `npm run dev`
3. Debes ver:
   ```
   MongoDB conectado correctamente: localhost
   Servidor corriendo en el puerto 3000
   ```

---

## ✅ PASO 2: Abre las páginas desde el puerto correcto

**❌ INCORRECTO (Live Server - puerto 5500):**
```
http://127.0.0.1:5500/front-vertice/consumidor.mis-pedidos.html
http://127.0.0.1:5500/front-vertice/comercio-pedido.html
```

**✅ CORRECTO (Backend - puerto 3000):**
```
http://localhost:3000/consumidor.mis-pedidos.html
http://localhost:3000/comercio-pedido.html
```

---

## ✅ PASO 3: Inicia sesión primero

**Antes de ver pedidos, DEBES estar logueado:**

1. Ve a: `http://localhost:3000/login.html`
2. Inicia sesión como **consumidor** o **comercio**
3. Verifica que te redirija correctamente

---

## ✅ PASO 4: Prueba los endpoints

### Test 1: Consumidor

1. Inicia sesión como **consumidor**
2. Ve a: `http://localhost:3000/consumidor.mis-pedidos.html`
3. Abre la consola (F12)
4. Observa:
   - ¿Sale error 401 (No autorizado)?
   - ¿Sale error 500 (Error del servidor)?
   - ¿Funciona correctamente?

### Test 2: Comercio

1. Inicia sesión como **comercio**
2. Ve a: `http://localhost:3000/comercio-pedido.html`
3. Abre la consola (F12)
4. Observa:
   - ¿Sale error 401 (No autorizado)?
   - ¿Sale error 500 (Error del servidor)?
   - ¿Funciona correctamente?

---

## 🔍 PASO 5: Revisa los logs del backend

Mientras haces los pasos anteriores, observa la **terminal del backend**.

**Deberías ver:**

```
📥 GET /consumidor.mis-pedidos.html
📥 GET /js-vivi/mis-pedidos-consumidor.js
📥 GET /js-vivi/notifications.js
📥 GET /api/pedidos/consumidor
🔐 authMiddleware - Headers: Bearer eyJhbGciOiJ...
✓ Token encontrado en header
✓ Token verificado: { id: '673...', role: 'consumidor', ... }
🔐 authRole - Usuario: { id: '673...', role: 'consumidor', ... }
🔐 authRole - Roles permitidos: [ 'consumidor' ]
✓ Usuario autorizado
🔍 getPedidosByConsumidor - Usuario: { id: '673...', ... }
🔍 Buscando pedidos para consumidorId: 673...
✓ Pedidos encontrados: 0
```

**Si NO ves estos logs, el problema es:**
- ❌ No estás accediendo desde `localhost:3000`
- ❌ El token no se está guardando en localStorage
- ❌ No iniciaste sesión correctamente

---

## ❓ Preguntas de Diagnóstico

Por favor responde TODAS estas preguntas:

1. **¿Desde qué URL abriste la página?**
   - [ ] `http://localhost:3000/...` ✅
   - [ ] `http://127.0.0.1:5500/...` ❌

2. **¿Iniciaste sesión antes de ir a ver pedidos?**
   - [ ] Sí
   - [ ] No

3. **¿Qué aparece en la consola del navegador? (F12)**
   - Copia y pega el error completo

4. **¿Qué aparece en la terminal del backend?**
   - Copia y pega los logs

5. **¿Tienes un token guardado?**
   - Abre la consola (F12)
   - Ejecuta: `localStorage.getItem('token')`
   - ¿Sale algo o `null`?

---

## 🚨 Problema Común #1: Live Server

**Si ves `127.0.0.1:5500` en la URL, ese es el problema.**

**Solución:**
1. **Detén Live Server** (botón "Port: 5500" en la barra inferior de VS Code)
2. Abre las páginas desde: `http://localhost:3000/`
3. El backend sirve los archivos HTML automáticamente

---

## 🚨 Problema Común #2: Sin token

**Si `localStorage.getItem('token')` devuelve `null`:**

**Solución:**
1. Ve a: `http://localhost:3000/login.html`
2. Inicia sesión
3. Verifica que se guarda el token:
   ```javascript
   localStorage.getItem('token') // Debe devolver algo como: eyJhbGc...
   ```
4. Ahora sí, ve a ver pedidos

---

## 🚨 Problema Común #3: Servidor no reiniciado

**Si los logs nuevos no aparecen:**

**Solución:**
1. En la terminal donde corre el servidor, presiona: `Ctrl + C`
2. Ejecuta nuevamente: `npm run dev`
3. Espera a ver: "Servidor corriendo en el puerto 3000"
4. Recarga las páginas en el navegador (F5)

---

## ✅ Checklist Completo

Marca cada item cuando lo hagas:

- [ ] Servidor backend corriendo en puerto 3000
- [ ] Accediendo desde `http://localhost:3000/` (NO 5500)
- [ ] Live Server DETENIDO
- [ ] Sesión iniciada (login completo)
- [ ] Token en localStorage verificado
- [ ] Consola del navegador abierta (F12)
- [ ] Terminal del backend visible
- [ ] Recargué la página después de reiniciar el servidor

---

## 📊 Resultado Esperado

**Si todo está bien, deberías ver:**

### En el navegador:
- ✅ Página carga sin errores
- ✅ Sistema de notificaciones aparece
- ✅ Lista de pedidos (aunque esté vacía)
- ✅ No hay error 401 o 500

### En la terminal del backend:
- ✅ Logs de las peticiones GET
- ✅ Logs del authMiddleware
- ✅ Logs del authRole
- ✅ Logs del getPedidosByConsumidor/Comerciante
- ✅ "✓ Pedidos encontrados: X"

---

Por favor **sigue esta guía paso a paso** y responde las preguntas. Así podré identificar exactamente dónde está el problema. 🔍
