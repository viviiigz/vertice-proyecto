import { PickUpPoint } from '../models/PickUpPoint.js';

// @desc    Crear un nuevo punto de retiro
// @route   POST /api/pickup-points
// @access  Private (Comerciante)
export const createPickUpPoint = async (req, res) => {
    try {
        const { nombre, direccion, horario } = req.body;
        const comercianteId = req.user.id;

        // Validación básica
        if (!nombre || !direccion) {
            return res.status(400).json({ success: false, message: 'El nombre y la dirección son obligatorios.' });
        }

        const newPickUpPoint = new PickUpPoint({
            comercianteId: comercianteId, // Corregido para coincidir con el modelo
            nombre,
            direccion,
            horario
        });

        await newPickUpPoint.save();

        res.status(201).json({
            success: true,
            message: 'Punto de retiro creado exitosamente.',
            data: newPickUpPoint
        });
    } catch (error) {
        console.error('Error al crear punto de retiro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Obtener todos los puntos de retiro del comerciante
// @route   GET /api/pickup-points
// @access  Private (Comerciante)
export const getPickUpPointsByComerciante = async (req, res) => {
    try {
        const comercianteId = req.user.id;
        const pickUpPoints = await PickUpPoint.find({ comercianteId: comercianteId }); // Corregido

        res.status(200).json({
            success: true,
            count: pickUpPoints.length,
            data: pickUpPoints
        });
    } catch (error) {
        console.error('Error al obtener puntos de retiro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Actualizar un punto de retiro
// @route   PUT /api/pickup-points/:id
// @access  Private (Comerciante)
export const updatePickUpPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const comercianteId = req.user.id;

        let pickUpPoint = await PickUpPoint.findById(id);

        if (!pickUpPoint) {
            return res.status(404).json({ success: false, message: 'Punto de retiro no encontrado.' });
        }

        // Verificar que el punto de retiro pertenece al comerciante
        if (pickUpPoint.comercianteId.toString() !== comercianteId) { // Corregido
            return res.status(403).json({ success: false, message: 'No autorizado para modificar este recurso.' });
        }

        pickUpPoint = await PickUpPoint.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Punto de retiro actualizado exitosamente.',
            data: pickUpPoint
        });
    } catch (error) {
        console.error('Error al actualizar punto de retiro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};

// @desc    Eliminar un punto de retiro
// @route   DELETE /api/pickup-points/:id
// @access  Private (Comerciante)
export const deletePickUpPoint = async (req, res) => {
    try {
        const { id } = req.params;
        const comercianteId = req.user.id;

        const pickUpPoint = await PickUpPoint.findById(id);

        if (!pickUpPoint) {
            return res.status(404).json({ success: false, message: 'Punto de retiro no encontrado.' });
        }

        // Verificar que el punto de retiro pertenece al comerciante
        if (pickUpPoint.comercianteId.toString() !== comercianteId) { // Corregido
            return res.status(403).json({ success: false, message: 'No autorizado para eliminar este recurso.' });
        }

        await pickUpPoint.deleteOne(); // Usar deleteOne() o remove()

        res.status(200).json({
            success: true,
            message: 'Punto de retiro eliminado exitosamente.'
        });
    } catch (error) {
        console.error('Error al eliminar punto de retiro:', error);
        res.status(500).json({ success: false, message: 'Error del servidor.' });
    }
};