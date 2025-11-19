import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    maxlength: 255
  },
  role: {
    type: String,
    enum: ['consumidor', 'comercio', 'banco', 'admin'],
    required: true
  },
  estadoVerificacion: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  documentoVerificacion: {
    type: String,
    default: null
  },
  // Campos de perfil (editables por el usuario)
  descripcion: {
    type: String,
    default: '',
    maxlength: 500
  },
  telefono: {
    type: String,
    default: '',
    maxlength: 20
  },
  direccion: {
    type: String,
    default: '',
    maxlength: 200
  },
  horarios: {
    type: String,
    default: '',
    maxlength: 200
  },
  fotoPerfil: {
    type: String,
    default: null // Puede ser una URL o el nombre del archivo guardado
  },
  donacionesTotales: {
    type: Number,
    default: 0 // Contador de productos para-donar ya entregados
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false
});

// Normalizar salida JSON/Objeto: exponer id en lugar de _id
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

userSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

// Los índices ya se crean automáticamente con unique: true
// No es necesario declararlos manualmente

const UserModel = mongoose.model('User', userSchema);

export default UserModel;