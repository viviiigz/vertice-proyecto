// src/models/associations.js
// En Mongoose, las relaciones se definen mediante referencias en el schema
// La relación ya está definida en product.model.js con el campo user_id que referencia a User
// No necesitamos definir asociaciones explícitas como en Sequelize

import UserModel from './user.models.js';
import Product from './product.model.js';

// Los modelos ya están configurados con sus relaciones:
// - Product tiene un campo user_id que referencia a User (equivalente a belongsTo)
// - Para obtener los productos de un usuario, usamos Product.find({ user_id: userId })

export { UserModel, Product };
