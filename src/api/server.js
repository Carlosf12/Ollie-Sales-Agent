const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { sequelize } = require('../../config/database'); 

// Importa todos tus modelos para que Sequelize los reconozca
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItems');

const { chatWithAI } = require('../agent/ollieAgent');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- Configuración de Express ---
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Definición de Asociaciones de Modelos ---
// ¡Importante!: Define las asociaciones DESPUÉS de que todos los modelos hayan sido importados.
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'itemsInCart' }); // Un producto puede estar en muchos ítems de carrito
CartItem.belongsTo(Product, { foreignKey: 'productId' }); // Un ítem de carrito pertenece a un producto

Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' }); // Un carrito tiene muchos ítems de carrito
CartItem.belongsTo(Cart, { foreignKey: 'cartId' }); // Un ítem de carrito pertenece a un carrito

// --- Conexión y Sincronización con la Base de Datos ---
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida exitosamente.');

        // Sincroniza todos los modelos (tablas) con la base de datos.
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas con la base de datos.');
    } catch (error) {
        console.error('❌ Error al conectar o sincronizar la base de datos:', error);
        // process.exit(1); 
    }
}

// --- Manejo de Conexiones Socket.IO ---
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('chat message', async (msg) => {
        console.log(`Mensaje recibido de web client (${socket.id}): ${msg}`);
        try {
            const aiResponse = await chatWithAI(msg);
            console.log(`Respuesta de OLLIE para web client (${socket.id}): ${aiResponse}`);
            socket.emit('chat message', `OLLIE: ${aiResponse}`);
        } catch (error) {
            console.error(`Error al obtener respuesta del AI para ${socket.id}:`, error);
            socket.emit('chat message', 'OLLIE: Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

// --- Inicio del Servidor ---
const PORT = process.env.PORT || 4000;

server.listen(PORT, async () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    await connectDB();
    console.log('¡OLLIE está listo para ayudarte!');
});