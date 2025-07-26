// config/database.js
require('dotenv').config(); // Carga las variables de entorno desde .env

const { Sequelize } = require('sequelize');

// Configuración de la conexión a la base de datos PostgreSQL
const sequelize = new Sequelize(
    process.env.DB_NAME,      // Nombre de la base de datos
    process.env.DB_USER,      // Usuario de la base de datos
    process.env.DB_PASSWORD,  // Contraseña del usuario
    {
        host: process.env.DB_HOST, // Host de la base de datos
        port: parseInt(process.env.DB_PORT, 10), // Aseguramos que el puerto sea un número entero
        dialect: 'postgres',       // Dialecto de la base de datos (PostgreSQL)
        logging: false,            // Desactiva el log de SQL en la consola (opcional)

        dialectOptions: {
            ssl: false // No intentar ninguna conexión SSL
        },

        pool: { // Configuración del pool de conexiones
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);



module.exports = {
    sequelize
};