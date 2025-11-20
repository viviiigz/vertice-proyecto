import express from 'express';
import ReporteModel from '../models/reporte.model.js';
import UserModel from '../models/user.models.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/reportes - crear un nuevo reporte (solo para bancos autenticados)
router.post('/', authMiddleware, async (req, res) => {
  console.log('📥 POST /api/reportes recibido');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  try {
    const { tipo, asunto, descripcion, prioridad, lote_id } = req.body;

    console.log('1. Datos extraídos:', { tipo, asunto, descripcion, prioridad, lote_id });

    // Validaciones
    if (!tipo || !asunto || !descripcion) {
      console.log('❌ Validación fallida: faltan campos obligatorios');
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo, asunto y descripción son obligatorios' 
      });
    }

    console.log('2. Validación de campos obligatorios: OK');

    // Verificar que el usuario sea un banco o admin (admin solo para testing)
    if (req.user.role !== 'banco' && req.user.role !== 'admin') {
      console.log('❌ Usuario no autorizado:', req.user.role);
      return res.status(403).json({ 
        success: false, 
        error: 'Solo los bancos pueden crear reportes' 
      });
    }

    console.log('3. Verificación de rol: OK');

    // Buscar el usuario completo en la base de datos
    console.log('4. Buscando usuario con ID:', req.user.id);
    const usuario = await UserModel.findById(req.user.id);
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(404).json({ 
        success: false, 
        error: 'Usuario no encontrado' 
      });
    }

    console.log('5. Usuario encontrado:', { id: usuario._id, username: usuario.username, email: usuario.email, role: usuario.role });

    console.log('6. Creando reporte...');
    const nuevoReporte = await ReporteModel.create({
      usuario_id: usuario._id,
      username: usuario.username,
      email: usuario.email,
      tipo,
      asunto,
      descripcion,
      prioridad: prioridad || 'normal',
      lote_id: lote_id || null,
      estado: 'pendiente'
    });

    console.log('✅ Reporte creado exitosamente:', nuevoReporte._id);

    return res.status(201).json({ 
      success: true, 
      reporte: nuevoReporte,
      mensaje: 'Reporte creado exitosamente'
    });
  } catch (error) {
    console.error('❌❌❌ Error al crear reporte:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al crear el reporte',
      detalle: error.message
    });
  }
});

// GET /api/reportes - obtener reportes del banco autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'banco') {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo los bancos pueden ver sus reportes' 
      });
    }

    const reportes = await ReporteModel.find({ usuario_id: req.user._id })
      .sort({ created_at: -1 })
      .lean();

    const reportesConId = reportes.map(r => ({
      ...r,
      id: r._id.toString()
    }));

    return res.json({ 
      success: true, 
      reportes: reportesConId 
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener reportes' 
    });
  }
});

export default router;
