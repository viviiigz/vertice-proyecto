import UserModel from '../models/user.models.js';

// GET /api/perfil - Obtener datos del perfil del usuario autenticado
export const getPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    return res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        descripcion: user.descripcion || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        horarios: user.horarios || '',
        fotoPerfil: user.fotoPerfil || '',
        documentoVerificacion: user.documentoVerificacion || '',
        estadoVerificacion: user.estadoVerificacion
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener perfil' });
  }
};

// PUT /api/perfil - Actualizar datos del perfil
export const updatePerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const { descripcion, telefono, direccion, horarios, fotoPerfil } = req.body;

    // Validar que solo se actualicen campos permitidos
    const updateData = {};
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (fotoPerfil !== undefined) updateData.fotoPerfil = fotoPerfil; // Data URL en base64
    
    // direccion y horarios solo para comercios
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (user.role === 'comercio') {
      if (direccion !== undefined) updateData.direccion = direccion;
      if (horarios !== undefined) updateData.horarios = horarios;
    }

    // Actualizar usuario
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return res.json({ 
      success: true, 
      message: 'Perfil actualizado correctamente',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        descripcion: updatedUser.descripcion || '',
        telefono: updatedUser.telefono || '',
        direccion: updatedUser.direccion || '',
        horarios: updatedUser.horarios || '',
        fotoPerfil: updatedUser.fotoPerfil || '',
        documentoVerificacion: updatedUser.documentoVerificacion || '',
        estadoVerificacion: updatedUser.estadoVerificacion
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
};
