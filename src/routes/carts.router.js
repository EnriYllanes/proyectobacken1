import { Router } from 'express';
// 🛑 ELIMINAR: import CartManager from '../../src/managers/CartManager.js';

// 🔑 NUEVO: Importar el servicio basado en Mongoose
import CartService from '../dao/Cart.service.js'; // Asegúrate que la ruta sea correcta

const router = Router();
// 🔑 NUEVO: Instancia del servicio
const cartService = CartService; // Asumiendo que CartService exporta la instancia por defecto

// =========================================================
// 🔑 POST /api/carts/ - Crea un nuevo carrito
// =========================================================
router.post('/', async (req, res) => {
    try {
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const newCart = await cartService.createCart();
        res.status(201).send({ status: "éxito", payload: newCart });
    } catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor al crear carrito." });
    }
});

// =========================================================
// 🔑 GET /api/carts/:cid - Lista los productos de un carrito
// =========================================================
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        // Asumiendo que getCartById() en el servicio usa .populate() o el middleware 'pre'
        const cart = await cartService.getCartById(cid); 

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        res.json({ status: 'success', payload: cart });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        // Si el ID es inválido (ej. no es un ObjectId válido), Mongoose lanza un error que manejamos como 400
        res.status(400).json({ status: 'error', message: 'ID de carrito inválido.' });
    }
});

// =========================================================
// 🔑 POST /api/carts/:cid/products/:pid - Agrega un producto al carrito
// 🚨 CORRECCIÓN: La URL debe ser 'products' (plural) para coincidir con tu JS
// =========================================================
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        // La cantidad puede venir en el body, sino asumimos 1 por defecto (como en tu JS)
        const { quantity = 1 } = req.body; 
        
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const updatedCart = await cartService.addProductToCart(cid, pid, quantity);

        res.send({ status: "éxito", payload: updatedCart });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).send({ status: "error", error: error.message });
        }
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor." });
    }
});

// =========================================================
// 🔑 DELETE api/carts/:cid/products/:pid - Elimina un producto
// =========================================================
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const updatedCart = await cartService.removeProductFromCart(cid, pid);

        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrito o Producto no encontrado.' });
        }

        res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// =========================================================
// 🔑 PUT api/carts/:cid - Actualiza el carrito con un array de productos
// =========================================================
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const productsArray = req.body; // Array con { product: ID, quantity: N }

    if (!Array.isArray(productsArray)) {
        return res.status(400).json({ status: 'error', message: 'El cuerpo de la solicitud debe ser un array de productos.' });
    }

    try {
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const updatedCart = await cartService.updateAllProducts(cid, productsArray); 
        
        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
        console.error("Error al actualizar todos los productos del carrito:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// =========================================================
// 🔑 PUT api/carts/:cid/products/:pid - Actualiza SÓLO la cantidad
// =========================================================
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un número positivo.' });
    }

    try {
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const updatedCart = await cartService.updateProductQuantity(cid, pid, quantity);
        
        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrito o Producto no encontrado.' });
        }

        res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
        console.error("Error al actualizar la cantidad del producto:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// =========================================================
// 🔑 DELETE api/carts/:cid - Elimina todos los productos del carrito
// =========================================================
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    
    try {
        // 🔑 CAMBIO: Usar el servicio de Mongoose
        const updatedCart = await cartService.clearCart(cid); 

        if (!updatedCart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado.' });
        }

        res.json({ status: 'success', message: 'Carrito vaciado exitosamente.', payload: updatedCart });
    } catch (error) {
        console.error("Error al vaciar el carrito:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

export default router;