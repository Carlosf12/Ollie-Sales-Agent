// src/models/Cart.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const CartItem = require('./CartItems'); // Importamos CartItem para definir la relación

const Cart = sequelize.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sessionId: { // Identificador único para la sesión del cliente (su carrito)
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Cada sesión tendrá un único carrito activo
    },
    // Podríamos añadir más campos aquí en el futuro, como 'status' (activo, completado), 'userId', etc.
}, {
    tableName: 'carts', // Nombre de la tabla en la DB
    timestamps: true, // Añade createdAt y updatedAt
});


module.exports = Cart;