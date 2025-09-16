import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserModel = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false
  }
},{
  timestamps: true,
  paranoid: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
});

export default UserModel;