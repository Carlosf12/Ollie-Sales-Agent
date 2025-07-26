const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const CartItem = require('./CartItems'); 

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
}, {
    tableName: 'carts',
    timestamps: true, 
});


module.exports = Cart;