import { UserModel, ProfileModel } from "../models/index.js";

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      include: [{ model: ProfileModel, as: "profile" }]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findByPk(req.params.id, {
      include: [{ model: ProfileModel, as: "profile" }]
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await UserModel.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json({ msg: "Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error eliminando usuario" });
  }
};