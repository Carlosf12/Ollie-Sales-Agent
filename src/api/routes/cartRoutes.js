const express = require('express');
const router = express.Router(); // Crea una nueva instancia de Router para las rutas del carrito
const tools = require('../../agent/tools'); // Asegúrate de la ruta correcta para las herramientas

// --- Rutas API para el Carrito ---

// POST /cart/items - Añadir un producto al carrito
router.post('/cart/items', async (req, res) => {
    const { productId, quantity } = req.body;
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ message: 'ID de producto inválido. Debe ser un número entero positivo.' });
    }
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Cantidad inválida. Debe ser un número entero positivo.' });
    }
    try {
        const result = await tools.addToCart(productId, quantity);
        if (result.startsWith("Error:")) {
            return res.status(400).json({ message: result });
        }
        res.status(200).json({ message: result, cart: tools.cart });
    } catch (error) {
        console.error('Error al añadir producto al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor al añadir producto al carrito.' });
    }
});

// PATCH /cart/items/:id - Actualizar la cantidad de un producto en el carrito o eliminarlo
router.patch('/cart/items/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ message: 'ID de producto inválido. Debe ser un número entero positivo.' });
    }
    if (isNaN(quantity) || quantity < 0) {
        return res.status(400).json({ message: 'Cantidad inválida. Debe ser un número entero no negativo.' });
    }

    try {
        const result = await tools.updateCartItem(productId, quantity);
        if (result.startsWith("Error:")) {
            return res.status(400).json({ message: result });
        }
        res.status(200).json({ message: result, cart: tools.cart });
    } catch (error) {
        console.error('Error al actualizar/eliminar producto del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar/eliminar producto del carrito.' });
    }
});

// GET /cart - Obtener el contenido actual del carrito
router.get('/cart', async (req, res) => {
    try {
        res.json({ cart: tools.cart });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el carrito.' });
    }
});

module.exports = router; // Exporta el router configurado para el carrito