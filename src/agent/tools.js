const { getProducts } = require('../utils/dataLoader');

let cart = [];

// --- Funciones de Herramientas ---

async function displayProducts() {
    const products = await getProducts(); // Obtiene los productos cargados (que ya son el 10% del total)
    if (!products || products.length === 0) {
        return "No hay productos disponibles en este momento.";
    }

    // Tomar solo los primeros 10 productos para mostrar al usuario
    const productsToDisplay = products.slice(0, 10);

    const productList = productsToDisplay.map(p => `ID: ${p.id}, Nombre: "${p.name}", Categoría: ${p.category}, Precio: $${p.price}, Cantidad: ${p.stock}, Descripcion:${p.description}`).join('\n');

    // Añadir una nota si hay más productos cargados pero no mostrados
    if (products.length > productsToDisplay.length) {
        return productList + "\n\n(Mostrando los primeros 10 productos de los disponibles. Puedes pedir detalles por ID para otros.)";
    }

    return productList;
}


async function getProductDetails(id) {
    const products = await getProducts();
    const product = products.find(p => p.id === id);
    if (!product) {
        return `Producto con ID ${id} no encontrado. Por favor, verifica el ID.`;
    }
    return `Detalles del producto ID ${product.id}:\nNombre: ${product.name}\nCategoría: ${product.category}\nPrecio: $${product.price}\nCantidad disponible: ${product.stock}\nDescripción: ${product.description}`;
}

async function addToCart(productId, stock = 1) {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) {
        return `Error: El producto con ID ${productId} no fue encontrado.`;
    }
    if (stock <= 0 || !Number.isInteger(stock)) {
        return `Error: La cantidad a añadir debe ser un número entero positivo.`;
    }
    if (product.stock < stock) {
        return `Error: No hay suficiente stock para el producto "${product.name}". Cantidad disponible: ${product.stock}.`;
    }

    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].stock += stock;
        product.stock -= stock;
        return `"${stock}" unidades de "${product.name}" añadidas. Cantidad total en carrito: ${cart[existingItemIndex].stock}. Stock restante: ${product.stock}.`;
    } else {
        cart.push({ productId, stock, name: product.name, price: product.price });
        product.stock -= stock;
        return `"${stock}" unidades de "${product.name}" añadidas al carrito. Stock restante: ${product.stock}.`;
    }
}

async function updateCartItem(productId, stock) {
    const products = await getProducts();
    const itemIndex = cart.findIndex(item => item.productId === productId);
    const product = products.find(p => p.id === productId);

    if (!product) {
        return `Error: El producto con ID ${productId} no fue encontrado.`;
    }

    if (itemIndex === -1) {
        return `Error: El producto "${product.name}" (ID ${productId}) no se encuentra en tu carrito.`;
    }

    const currentCartstock = cart[itemIndex].stock;
    const stockAvailable = product.stock + currentCartstock; 

    if (stock === 0) {
        cart.splice(itemIndex, 1);
        product.stock += currentCartstock;
        return `El producto "${product.name}" ha sido eliminado de tu carrito.`;
    } else if (stock > 0) {
        if (!Number.isInteger(stock)) {
            return `Error: La cantidad a actualizar debe ser un número entero positivo.`;
        }
        if (stockAvailable < stock) {
            return `Error: No hay suficiente stock para actualizar la cantidad de "${product.name}" a ${stock}. Cantidad disponible: ${stockAvailable}.`;
        }
        const stockDifference = stock - currentCartstock;
        cart[itemIndex].stock = stock;
        product.stock -= stockDifference;
        return `Cantidad de "${product.name}" actualizada a ${stock} en tu carrito. Stock restante: ${product.stock}.`;
    } else {
        return `Error: La cantidad debe ser un número positivo o 0 para eliminar.`;
    }
}

async function viewCart() {
    if (cart.length === 0) {
        return "Tu carrito de compras está vacío en este momento.";
    }

    let cartDetails = "Contenido actual de tu carrito:\n";
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.stock * item.price;
        cartDetails += `- ${item.name} (ID: ${item.productId}) - Cantidad: ${item.stock} x $${item.price} = $${itemTotal}\n`;
        total += itemTotal;
    });

    cartDetails += `\nTotal del carrito: $${total}`;
    return cartDetails;
}

module.exports = {
    displayProducts,
    getProductDetails,
    addToCart,
    updateCartItem,
    viewCart,
};