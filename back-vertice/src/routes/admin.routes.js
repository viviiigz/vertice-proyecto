import { Router } from 'express';
import UserModel from '../models/user.models.js';
import ProductModel from '../models/product.model.js';
import mongoose from 'mongoose';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authRole } from '../middlewares/authRole.js';

const router = Router();

// Ruta de depuración NO protegida (solo para desarrollo local): devuelve solicitudes pendientes
// Úsala temporalmente para verificar si las solicitudes existen en la base de datos sin pasar por auth
router.get('/solicitudes/debug', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }
    const solicitudes = await UserModel.find({ estadoVerificacion: 'pendiente', role: 'banco' }).select('username email documentoVerificacion created_at');
    return res.json({ success: true, solicitudes });
  } catch (error) {
    console.error('Error en debug solicitudes:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener solicitudes (debug)' });
  }
});

// Ruta mock NO protegida para desarrollo: devuelve datos de ejemplo cuando la DB no está disponible
router.get('/solicitudes/mock', async (req, res) => {
  try {
    const now = new Date();
    const mock = [
      { _id: 'mock-1', username: 'Banco Alimentario Central', email: 'central@banco.test', documentoVerificacion: 'mock-central.pdf', created_at: now },
      { _id: 'mock-2', username: 'Banco Solidario Norte', email: 'norte@banco.test', documentoVerificacion: 'mock-norte.pdf', created_at: now }
    ];
    return res.json({ success: true, solicitudes: mock });
  } catch (error) {
    console.error('Error en mock solicitudes:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener solicitudes (mock)' });
  }
});

// Ruta de diagnóstico rápida (no protegida) -> /api/admin/_ping
router.get('/_ping', (req, res) => {
  return res.json({ ok: true, msg: 'admin routes loaded' });
});

// Ruta debug para comercios (sin protección - solo para desarrollo)
router.get('/comercios/debug', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }
    const comercios = await UserModel.find({ role: 'comercio' })
      .select('username email telefono direccion fotoPerfil estadoVerificacion created_at donacionesTotales')
      .sort({ created_at: -1 })
      .lean();
    
    const comerciosConFoto = comercios.map(c => ({
      ...c,
      id: c._id.toString(),
      fotoPerfil: c.fotoPerfil || null,
      donacionesTotales: c.donacionesTotales || 0
    }));
    
    return res.json({ success: true, total: comerciosConFoto.length, comercios: comerciosConFoto });
  } catch (error) {
    console.error('Error en debug comercios:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta debug para reportes (sin protección - solo para desarrollo)
router.get('/reportes/debug', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { filtro } = req.query;
    let query = {};
    
    if (filtro === 'urgentes') {
      query = { prioridad: { $in: ['alta', 'critica'] }, estado: { $ne: 'resuelto' } };
    } else if (filtro === 'resueltos') {
      query = { estado: 'resuelto' };
    }

    const reportes = await ReporteModel.find(query)
      .sort({ prioridad: -1, created_at: -1 })
      .lean();

    const reportesConId = reportes.map(r => ({
      ...r,
      id: r._id.toString()
    }));

    return res.json({ 
      success: true, 
      reportes: reportesConId,
      total: reportesConId.length
    });
  } catch (error) {
    console.error('Error en debug reportes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Ruta debug para detalle de reporte (sin protección - solo para desarrollo)
router.get('/reportes/debug/:id', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { id } = req.params;
    const reporte = await ReporteModel.findById(id).lean();

    if (!reporte) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    }

    const reporteConId = {
      ...reporte,
      id: reporte._id.toString()
    };

    return res.json({ 
      success: true, 
      reporte: reporteConId
    });
  } catch (error) {
    console.error('Error en debug detalle reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Proteger todas las rutas de admin: requiere token y rol 'admin'
router.use(authMiddleware, authRole(['admin']));

// GET /admin/stats - obtener estadísticas para el dashboard
router.get('/stats', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    // Contar productos para donar activos (cantidad_disponible > 0)
    const donacionesActivas = await ProductModel.countDocuments({ 
      categoria: 'para-donar', 
      cantidad_disponible: { $gt: 0 } 
    });

    // Contar bancos pendientes de aprobación
    const bancosPendientes = await UserModel.countDocuments({ 
      role: 'banco', 
      estadoVerificacion: 'pendiente' 
    });

    return res.json({ 
      success: true, 
      stats: {
        donacionesActivas,
        bancosPendientes
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener estadísticas' });
  }
});

// GET /admin/comercios - obtener lista de comercios registrados
router.get('/comercios', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const comercios = await UserModel.find({ role: 'comercio' })
      .select('username email telefono direccion fotoPerfil estadoVerificacion created_at donacionesTotales')
      .sort({ created_at: -1 })
      .lean();

    // Asegurar que fotoPerfil esté presente (aunque sea null)
    const comerciosConFoto = comercios.map(c => ({
      ...c,
      id: c._id.toString(),
      fotoPerfil: c.fotoPerfil || null,
      donacionesTotales: c.donacionesTotales || 0
    }));

    return res.json({ 
      success: true, 
      comercios: comerciosConFoto 
    });
  } catch (error) {
    console.error('Error al obtener comercios:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener comercios' });
  }
});

// GET /admin/comercios/:id - obtener detalle completo de un comercio
router.get('/comercios/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { id } = req.params;
    const comercio = await UserModel.findById(id)
      .select('-password')
      .lean(); // Excluir contraseña

    if (!comercio) {
      return res.status(404).json({ success: false, error: 'Comercio no encontrado' });
    }

    // Contar productos del comercio (usar user_id que es el campo correcto en el modelo)
    const totalProductos = await ProductModel.countDocuments({ user_id: id });

    // Asegurar campos necesarios
    const comercioData = {
      ...comercio,
      id: comercio._id.toString(),
      fotoPerfil: comercio.fotoPerfil || null,
      donacionesTotales: comercio.donacionesTotales || 0
    };

    return res.json({ 
      success: true, 
      comercio: comercioData,
      totalProductos
    });
  } catch (error) {
    console.error('Error al obtener detalle del comercio:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener detalle del comercio' });
  }
});

// GET /admin/solicitudes - mostrar solicitudes de bancos pendientes
router.get('/solicitudes', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).send('Servicio temporalmente no disponible (DB desconectada)');
    }
    const solicitudes = await UserModel.find({ estadoVerificacion: 'pendiente', role: 'banco' });
    return res.render('admin-solicitudes', { solicitudes });
  } catch (error) {
    console.error('Error al obtener solicitudes de bancos:', error);
    return res.status(500).send('Error al obtener solicitudes');
  }
});

// GET /admin/solicitudes/data - devolver JSON con solicitudes pendientes (para frontend SPA)
router.get('/solicitudes/data', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }
    const solicitudes = await UserModel.find({ estadoVerificacion: 'pendiente', role: 'banco' }).select('username email documentoVerificacion created_at');
    return res.json({ success: true, solicitudes });
  } catch (error) {
    console.error('Error al obtener solicitudes (data):', error);
    return res.status(500).json({ success: false, error: 'Error al obtener solicitudes' });
  }
});

// Aceptar una solicitud (marcar como 'aprobado')
router.post('/solicitudes/:id/aceptar', async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { estadoVerificacion: 'aprobado' });
    // Si la solicitud es AJAX, responder JSON para que el front pueda actualizar sin recargar
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, action: 'aprobado', id });
    }
    // Si no es AJAX, redirigir de regreso al panel
    return res.redirect('/api/admin/solicitudes');
  } catch (error) {
    console.error('Error al aceptar la solicitud:', error);
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, error: 'Error al aceptar la solicitud' });
    }
    return res.status(500).send('Error al aceptar la solicitud');
  }
});

// Rechazar una solicitud (marcar como 'rechazado')
router.post('/solicitudes/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { estadoVerificacion: 'rechazado' });
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.json({ success: true, action: 'rechazado', id });
    }
    return res.redirect('/api/admin/solicitudes');
  } catch (error) {
    console.error('Error al rechazar la solicitud:', error);
    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json({ success: false, error: 'Error al rechazar la solicitud' });
    }
    return res.status(500).send('Error al rechazar la solicitud');
  }
});

// ============================================
// RUTAS DE REPORTES/SOPORTE
// ============================================

// GET /admin/reportes - obtener reportes con filtros
router.get('/reportes', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { filtro } = req.query; // 'todos', 'urgentes', 'resueltos'
    
    let query = {};
    
    if (filtro === 'urgentes') {
      query = { prioridad: { $in: ['alta', 'critica'] }, estado: { $ne: 'resuelto' } };
    } else if (filtro === 'resueltos') {
      query = { estado: 'resuelto' };
    }
    // Si filtro === 'todos' o no se especifica, no se aplica filtro

    const reportes = await ReporteModel.find(query)
      .sort({ prioridad: -1, created_at: -1 })
      .lean();

    const reportesConId = reportes.map(r => ({
      ...r,
      id: r._id.toString()
    }));

    return res.json({ 
      success: true, 
      reportes: reportesConId,
      total: reportesConId.length
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener reportes' });
  }
});

// GET /admin/reportes/:id - obtener detalle de un reporte
router.get('/reportes/:id', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { id } = req.params;
    const reporte = await ReporteModel.findById(id).lean();

    if (!reporte) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    }

    const reporteConId = {
      ...reporte,
      id: reporte._id.toString()
    };

    return res.json({ 
      success: true, 
      reporte: reporteConId
    });
  } catch (error) {
    console.error('Error al obtener detalle del reporte:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener detalle del reporte' });
  }
});

// PUT /admin/reportes/:id/estado - cambiar estado de un reporte
router.put('/reportes/:id/estado', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { id } = req.params;
    const { estado } = req.body;

    if (!['pendiente', 'en_proceso', 'resuelto', 'cerrado'].includes(estado)) {
      return res.status(400).json({ success: false, error: 'Estado inválido' });
    }

    const updateData = { estado };
    
    // Si se marca como resuelto, guardar fecha
    if (estado === 'resuelto' || estado === 'cerrado') {
      updateData.fecha_resolucion = new Date();
    }

    const reporte = await ReporteModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).lean();

    if (!reporte) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    }

    return res.json({ 
      success: true, 
      reporte: {
        ...reporte,
        id: reporte._id.toString()
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error);
    return res.status(500).json({ success: false, error: 'Error al actualizar estado' });
  }
});

// POST /admin/reportes/:id/responder - agregar respuesta a un reporte
router.post('/reportes/:id/responder', async (req, res) => {
  try {
    const ReporteModel = (await import('../models/reporte.model.js')).default;
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, error: 'DB_NOT_CONNECTED' });
    }

    const { id } = req.params;
    const { mensaje } = req.body;

    if (!mensaje || mensaje.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'El mensaje no puede estar vacío' });
    }

    // Obtener info del admin desde el token
    const adminId = req.user._id;
    const adminUsername = req.user.username || 'Admin';

    const respuesta = {
      admin_id: adminId,
      admin_username: adminUsername,
      mensaje: mensaje.trim(),
      fecha: new Date()
    };

    const reporte = await ReporteModel.findByIdAndUpdate(
      id,
      { 
        $push: { respuestas: respuesta },
        estado: 'en_proceso' // Cambiar a en proceso si estaba pendiente
      },
      { new: true }
    ).lean();

    if (!reporte) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado' });
    }

    return res.json({ 
      success: true, 
      reporte: {
        ...reporte,
        id: reporte._id.toString()
      },
      mensaje: 'Respuesta agregada exitosamente'
    });
  } catch (error) {
    console.error('Error al responder reporte:', error);
    return res.status(500).json({ success: false, error: 'Error al responder reporte' });
  }
});

export default router;
