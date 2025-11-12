import { Router } from 'express';
import UserModel from '../models/user.models.js';
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

// Proteger todas las rutas de admin: requiere token y rol 'admin'
router.use(authMiddleware, authRole(['admin']));

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
    return res.json({ success: true, action: 'aprobado', id });
  } catch (error) {
    console.error('Error al aceptar la solicitud:', error);
    return res.status(500).json({ success: false, error: 'Error al aceptar la solicitud' });
  }
});

// Rechazar una solicitud (marcar como 'rechazado')
router.post('/solicitudes/:id/rechazar', async (req, res) => {
  try {
    const { id } = req.params;
    await UserModel.findByIdAndUpdate(id, { estadoVerificacion: 'rechazado' });
    return res.json({ success: true, action: 'rechazado', id });
  } catch (error) {
    console.error('Error al rechazar la solicitud:', error);
    return res.status(500).json({ success: false, error: 'Error al rechazar la solicitud' });
  }
});

export default router;
