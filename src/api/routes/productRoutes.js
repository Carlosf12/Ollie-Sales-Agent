const express = require('express');
const router = express.Router(); 
const dataLoader = require('../../utils/dataLoader'); 

// --- Rutas API para Productos ---

// GET /products - Obtener todos los productos (los cargados desde el Excel)
router.get('/products', async (req, res) => {
    try {
        const allLoadedProducts = await dataLoader.getProducts(); 
        res.json(allLoadedProducts);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

// GET /products/:id - Obtener detalles de un producto específico
router.get('/products/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ message: 'ID de producto inválido. Debe ser un número entero positivo.' });
    }
    try {
        const allLoadedProducts = await dataLoader.getProducts();
        const product = allLoadedProducts.find(p => p.id === productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: `Producto con ID ${productId} no encontrado.` });
        }
    } catch (error) {
        console.error('Error al obtener detalles del producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener detalles del producto.' });
    }
});

module.exports = router; // Exporta el router configurado para productos