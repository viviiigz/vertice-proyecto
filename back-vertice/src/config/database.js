import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
process.env.DB_NAME,
process.env.DB_USER,
process.env.DB_PASSWORD,
{
host: process.env.DB_HOST,
dialect: process.env.DB_DIALECT,

logging: console.log,
port: 3307 
});

export default sequelize;