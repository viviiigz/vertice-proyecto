//para probar si funciona la base de datos
import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const UserModel = sequelize.define(
  "User",
  {
    username: {
      type: DataTypes.CHAR(20),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.CHAR(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.CHAR(),
      allowNull: false,
    }
  },
  {
    timestamps: true,
    paranoid: true,
  }
);



export default UserModel;