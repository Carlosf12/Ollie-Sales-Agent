// src/models/CartItem.js (Código ACTUALIZADO)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); // Asegúrate que la ruta a database.js es correcta

// No necesitamos importar Product y Cart aquí si las asociaciones se definen en server.js
// const Product = require('./Product');
// const Cart = require('./Cart');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'carts', // <-- ¡CAMBIO AQUÍ! Usa el nombre de la tabla como STRING
            key: 'id',
        },
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products', // <-- ¡CAMBIO AQUÍ! Usa el nombre de la tabla como STRING
            key: 'id',
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0,
        },
    },
}, {
    tableName: 'cart_items', // Nombre de la tabla en la base de datos
    timestamps: true,
});


module.exports = CartItem;