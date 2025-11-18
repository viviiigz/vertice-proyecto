# 📍 Puntos de Retiro (Pick-Up) - Vértice

## 🗺️ Ubicaciones Fijas

Vértice utiliza **3 puntos de retiro fijos** en la ciudad de Formosa para facilitar la logística:

### 1. Plaza San Martín (Centro)
- **📍 Ubicación:** Plaza San Martín, Centro, Formosa
- **🌐 Coordenadas:** -26.1835, -58.1752
- **📝 Descripción:** Punto de retiro en el centro de la ciudad
- **✅ Estado:** Activo

### 2. Virgen Desatanudos (Circuito 5)
- **📍 Ubicación:** Virgen Desatanudos, Circuito 5, Formosa
- **🌐 Coordenadas:** -26.1550, -58.2105
- **📝 Descripción:** Punto de retiro en zona de Circuito 5
- **✅ Estado:** Activo

### 3. La Cruz (Costanera)
- **📍 Ubicación:** La Cruz, Costanera, Formosa
- **🌐 Coordenadas:** -26.1772, -58.1633
- **📝 Descripción:** Punto de retiro en la costanera
- **✅ Estado:** Activo

---

## 🎯 ¿Por qué Puntos Fijos?

Vértice actúa como **intermediario** entre comerciantes y consumidores:

- ✅ **Logística simplificada:** Los comerciantes solo entregan en 3 ubicaciones conocidas
- ✅ **Seguridad:** Puntos públicos y de fácil acceso
- ✅ **Eficiencia:** Reduce costos y tiempos de entrega
- ✅ **Flexibilidad:** El consumidor elige el punto más cercano a su ubicación

---

## 🔧 Implementación Técnica

### Frontend (Para Comerciantes)
**Archivo:** `front-vertice/comercio-pickup.html`
**Script:** `front-vertice/js-vivi/comercio-pickup.js`

Los comerciantes ven un mapa visual con los 3 puntos marcados en verde.

### Frontend (Para Consumidores)
**Archivo:** `front-vertice/consumidor.elegir-pickup.html`
**Script:** `front-vertice/js-vivi/elegir-pickup.js`

Los consumidores:
1. Seleccionan un punto de retiro (mapa interactivo + lista)
2. Eligen horario de retiro (6 opciones de 2 horas cada una)
3. Confirman el pedido

### Backend
**Modelo:** `back-vertice/src/models/PuntoRetiroPublico.js`
**Controller:** `back-vertice/src/controllers/pedidoController.js`
**Endpoint:** `GET /api/pedidos/puntos-retiro`

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ Consumidor ve mapa → Elige punto → Selecciona horario  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Se crea pedido con: puntoDeRetiro + horarioRetiro      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Comerciante ve pedido → Acepta → Prepara → Entrega     │
│ al punto seleccionado en el horario acordado            │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Inicialización de Puntos

### Opción 1: Usar Puntos Hardcodeados (Actual)
Los puntos están definidos directamente en `elegir-pickup.js`:

```javascript
const PUNTOS_RETIRO_FIJOS = [
    { 
        nombre: 'Plaza San Martín (Centro)', 
        direccion: 'Plaza San Martín, Centro, Formosa',
        latitud: -26.1835, 
        longitud: -58.1752,
        descripcion: 'Punto de retiro en el centro de la ciudad',
        activo: true
    },
    // ... otros puntos
];
```

**✅ Ventaja:** Funciona sin base de datos, siempre disponibles  
**❌ Desventaja:** Requiere modificar código para cambiar puntos

### Opción 2: Crear en Base de Datos
Ejecutar el script de inicialización:

```bash
cd back-vertice
node scripts/create-pickup-points.js
```

**✅ Ventaja:** Los puntos se pueden administrar desde el backend  
**❌ Desventaja:** Requiere conexión a BD

### Sistema Híbrido (Implementado ✅)
El sistema usa **ambos métodos con fallback**:

1. **Primero:** Intenta cargar desde API (`/api/pedidos/puntos-retiro`)
2. **Fallback:** Si no hay puntos o hay error, usa `PUNTOS_RETIRO_FIJOS`

```javascript
async function loadPickupPoints() {
    try {
        const response = await fetch(`${API_URL}/pedidos/puntos-retiro`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                puntosRetiro = data.data; // Desde BD
                return;
            }
        }
        
        // Fallback a puntos fijos
        puntosRetiro = PUNTOS_RETIRO_FIJOS;
        
    } catch (error) {
        // En caso de error, usar puntos fijos
        puntosRetiro = PUNTOS_RETIRO_FIJOS;
    }
}
```

---

## 🎨 Personalización Visual

### Marcadores del Mapa
Los puntos usan un **icono verde personalizado** con el color de Vértice (#4cd309):

```javascript
const iconoVerde = L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
            <path fill="#4cd309" stroke="#2d8006" stroke-width="1.5" 
                  d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/>
            <circle fill="white" cx="12" cy="9" r="3.5"/>
        </svg>
    `),
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45]
});
```

### Popup al Clickear
```html
<h5 style="font-family: 'Montserrat', sans-serif; margin: 0; color: #4cd309;">
    Plaza San Martín (Centro)
</h5>
<p style="margin: 5px 0 0 0; font-size: 0.9em;">
    Plaza San Martín, Centro, Formosa
</p>
```

---

## 🔄 Sincronización de Datos

### Archivos que Definen los Puntos

| Archivo | Propósito | Coordenadas |
|---------|-----------|-------------|
| `comercio-pickup.js` | Vista comerciante | ✅ -26.1835, -58.1752, etc |
| `elegir-pickup.js` | Vista consumidor | ✅ -26.1835, -58.1752, etc |
| `create-pickup-points.js` | Script BD | ✅ -26.1835, -58.1752, etc |

**✅ Todos sincronizados con las mismas coordenadas**

---

## 🧪 Cómo Probar

### 1. Verificar como Comerciante
```
1. Abre: http://localhost:3000/comercio-pickup.html
2. Deberías ver un mapa con 3 marcadores verdes
3. Clickea cada marcador para ver el popup
```

### 2. Verificar como Consumidor
```
1. Agrega productos al carrito
2. Ve al carrito: consumidor.carrito.html
3. Clic en "Continuar al Checkout"
4. Deberías ver consumidor.elegir-pickup.html con:
   - Mapa con 3 marcadores verdes
   - Lista de 3 opciones con radio buttons
   - 6 horarios disponibles
```

### 3. Verificar API (Opcional)
```bash
# Verifica si hay puntos en la BD
curl http://localhost:3000/api/pedidos/puntos-retiro
```

**Respuesta esperada:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "...",
      "nombre": "Plaza San Martín (Centro)",
      "direccion": "Plaza San Martín, Centro, Formosa",
      "latitud": -26.1835,
      "longitud": -58.1752,
      "activo": true
    }
    // ... otros 2 puntos
  ]
}
```

---

## 🚨 Solución de Problemas

### Problema: "No hay puntos de retiro disponibles"

**Causa:** El sistema no pudo cargar desde la API ni encontró puntos fijos

**Solución:**
1. Verifica que `PUNTOS_RETIRO_FIJOS` esté definido en `elegir-pickup.js`
2. Revisa la consola del navegador (F12) para ver logs
3. Verifica que el backend esté corriendo

### Problema: El mapa no se muestra

**Causa:** Librería Leaflet no se cargó

**Solución:**
```html
<!-- Verifica que este script esté en el HTML -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

### Problema: Marcadores no aparecen

**Causa:** Coordenadas incorrectas o `puntosRetiro` vacío

**Solución:**
```javascript
// Abre consola del navegador (F12) y ejecuta:
console.log(puntosRetiro);

// Debería mostrar array con 3 objetos
```

---

## ✅ Checklist de Verificación

Antes de usar el sistema de pickup, verifica:

- [ ] `comercio-pickup.html` muestra mapa con 3 puntos
- [ ] `elegir-pickup.js` tiene `PUNTOS_RETIRO_FIJOS` definido
- [ ] Backend tiene endpoint `/api/pedidos/puntos-retiro`
- [ ] Script `create-pickup-points.js` tiene coordenadas correctas
- [ ] Todas las coordenadas son idénticas en todos los archivos
- [ ] Leaflet.js está incluido en ambas páginas HTML
- [ ] Los 3 puntos tienen nombres descriptivos y consistentes

---

## 📝 Notas Adicionales

### Horarios de Retiro
Los consumidores pueden elegir entre 6 franjas horarias:

- 10:00 - 12:00
- 12:00 - 14:00
- 14:00 - 16:00
- 16:00 - 18:00
- 18:00 - 20:00
- 20:00 - 22:00

### Validaciones
- ✅ Solo se pueden crear pedidos con puntos válidos
- ✅ El horario de retiro es obligatorio
- ✅ El punto seleccionado debe estar activo

### Futuras Mejoras
- 🔮 Panel admin para gestionar puntos de retiro
- 🔮 Agregar más puntos dinámicamente
- 🔮 Permitir a comerciantes elegir en qué puntos entregan
- 🔮 Calcular distancias desde ubicación del usuario
- 🔮 Notificaciones cuando el pedido está listo en el punto

---

**🎉 ¡Sistema de Puntos de Retiro Completamente Funcional!**
