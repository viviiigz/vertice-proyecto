//ana trabaja aca
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vertice', {
      // Opciones de conexión (ya no son necesarias en versiones recientes de Mongoose)
    });
    console.log(`MongoDB conectado correctamente: ${conn.connection.host}`);
  } catch (error) {
    // No hacemos exit aquí para que la app pueda iniciarse en modo degradado y mostrar mensajes
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    // Propagar el error para que el llamador decida qué hacer
    throw error;
  }
};

export default connectDB;