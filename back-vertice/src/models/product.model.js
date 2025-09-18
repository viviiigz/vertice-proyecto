import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_producto: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // precio_original: {
  //   type: DataTypes.DECIMAL(10, 2),
  //   allowNull: false
  // },
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha_caducidad_cercana: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  foto_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default Product;