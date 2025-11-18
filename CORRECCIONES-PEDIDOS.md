# ✅ Correcciones Implementadas

**Fecha:** 12 de Noviembre, 2025  
**Archivos modificados:** 2

---

## 🔧 Corrección 1: Filtros en comercio-pedido.html

### Problema
Los filtros "Completados" y "Cancelados" no mostraban los pedidos con estados "aceptado" y "rechazado".

### Causa
Los filtros buscaban estados exactos (`completado`, `cancelado`) pero en la base de datos los estados reales son diferentes:
- Estados disponibles: `pendiente`, `aceptado`, `rechazado`, `entregado`, `cancelado`

### Solución
Actualicé la lógica de filtrado en `comercio-pedidos.js`:

```javascript
// Antes (línea 117):
filtered = allPedidos.filter(pedido => pedido.estado === currentFilter);

// Después (líneas 113-121):
if (currentFilter === 'completado') {
    // Completados: aceptado + entregado
    filtered = allPedidos.filter(pedido => 
        pedido.estado === 'aceptado' || pedido.estado === 'entregado'
    );
} else if (currentFilter === 'cancelado') {
    // Cancelados: cancelado + rechazado
    filtered = allPedidos.filter(pedido => 
        pedido.estado === 'cancelado' || pedido.estado === 'rechazado'
    );
}
```

### Resultado
- ✅ Filtro "Completados" ahora muestra: pedidos **aceptados** + **entregados**
- ✅ Filtro "Cancelados" ahora muestra: pedidos **cancelados** + **rechazados**
- ✅ Filtro "Pendientes" muestra solo: pedidos **pendientes**
- ✅ Filtro "Todos" muestra: **todos** los pedidos

---

## 🖼️ Corrección 2: Foto de perfil del comerciante en consumidor.mis-pedidos.html

### Problema
La foto de perfil del comerciante no se mostraba en la vista de pedidos del consumidor.

### Causa
El código ya estaba implementado (línea 136-138) pero la construcción de la URL de la imagen no manejaba correctamente todos los casos posibles de rutas.

### Solución
Mejoré el manejo de la URL de la foto de perfil en `mis-pedidos-consumidor.js`:

```javascript
// Antes (líneas 136-138):
const comercianteAvatar = comerciante.fotoPerfil 
    ? `http://localhost:3000/uploads/${comerciante.fotoPerfil}` 
    : './assets/imgs/placeholder-user.png';

// Después (líneas 136-150):
let comercianteAvatar = './assets/imgs/placeholder-user.png';
if (comerciante.fotoPerfil) {
    // Si ya tiene el path completo, usarlo directo
    if (comerciante.fotoPerfil.startsWith('http')) {
        comercianteAvatar = comerciante.fotoPerfil;
    } 
    // Si tiene /uploads/ o uploads/, quitar barra inicial
    else if (comerciante.fotoPerfil.startsWith('/uploads/') || 
             comerciante.fotoPerfil.startsWith('uploads/')) {
        comercianteAvatar = `http://localhost:3000/${comerciante.fotoPerfil.replace(/^\//, '')}`;
    } 
    // Si es solo el nombre del archivo
    else {
        comercianteAvatar = `http://localhost:3000/uploads/${comerciante.fotoPerfil}`;
    }
}
```

### Resultado
- ✅ La foto de perfil del comerciante ahora se muestra correctamente
- ✅ Maneja múltiples formatos de ruta (URL completa, path relativo, nombre de archivo)
- ✅ Si no hay foto, muestra un placeholder por defecto

---

## 📊 Estados de Pedidos (Referencia)

Para entender mejor el flujo:

| Estado | Descripción | Filtro |
|--------|-------------|--------|
| `pendiente` | Pedido creado, esperando confirmación del comerciante | Pendientes |
| `aceptado` | Comerciante aceptó el pedido | Completados |
| `rechazado` | Comerciante rechazó el pedido | Cancelados |
| `entregado` | Pedido entregado al consumidor | Completados |
| `cancelado` | Pedido cancelado por el comerciante | Cancelados |

---

## 🧪 Pruebas Recomendadas

### Test 1: Filtros de Comercio
1. Inicia sesión como **comercio**
2. Ve a `http://localhost:3000/comercio-pedido.html`
3. Acepta algunos pedidos
4. Rechaza algunos pedidos
5. Marca algunos como entregados
6. Prueba cada filtro:
   - "Pendientes" → Solo muestra pendientes ✅
   - "Completados" → Muestra aceptados + entregados ✅
   - "Cancelados" → Muestra rechazados + cancelados ✅
   - "Todos" → Muestra todos ✅

### Test 2: Foto de Perfil
1. Asegúrate de que el comerciante tenga foto de perfil configurada
2. Crea un pedido como consumidor
3. Ve a `http://localhost:3000/consumidor.mis-pedidos.html`
4. Verifica que aparezca la foto del comerciante ✅
5. Si el comerciante no tiene foto, verifica que aparezca el placeholder ✅

---

## ✅ Checklist de Implementación

- [x] Actualizar lógica de filtrado en `comercio-pedidos.js`
- [x] Agregar comentarios explicativos
- [x] Mejorar manejo de URL de foto de perfil
- [x] Manejar casos edge (sin foto, diferentes formatos de ruta)
- [x] Mantener compatibilidad con código existente
- [x] Sin cambios en el backend (solo frontend)

---

## 📝 Notas Adicionales

- No se requieren cambios en el backend
- Los cambios son retrocompatibles
- Los usuarios no necesitan volver a iniciar sesión
- No se afecta ninguna otra funcionalidad

---

**Estado:** ✅ Implementado y Listo para Probar  
**Impacto:** Mejora UX - Sin breaking changes
