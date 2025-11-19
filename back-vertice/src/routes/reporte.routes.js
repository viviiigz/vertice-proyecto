import express from 'express';
import ReporteModel from '../models/reporte.model.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// POST /api/reportes - crear un nuevo reporte (solo para bancos autenticados)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, asunto, descripcion, prioridad, lote_id } = req.body;

    // Validaciones
    if (!tipo || !asunto || !descripcion) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tipo, asunto y descripción son obligatorios' 
      });
    }

    // Verificar que el usuario sea un banco
    if (req.user.role !== 'banco') {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo los bancos pueden crear reportes' 
      });
    }

    const nuevoReporte = await ReporteModel.create({
      usuario_id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      tipo,
      asunto,
      descripcion,
      prioridad: prioridad || 'normal',
      lote_id: lote_id || null,
      estado: 'pendiente'
    });

    return res.status(201).json({ 
      success: true, 
      reporte: nuevoReporte,
      mensaje: 'Reporte creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al crear el reporte' 
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
