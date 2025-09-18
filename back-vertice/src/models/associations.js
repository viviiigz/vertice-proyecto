// src/models/associations.js
import UserModel from './user.models.js';
import Product from './product.model.js';

// Relación: un usuario puede tener muchos productos
UserModel.hasMany(Product, { foreignKey: 'user_id', as: 'products' });

// Relación: cada producto pertenece a un usuario
Product.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' });

export { UserModel, Product };
