import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager();

// POST /api/carts/ - Crea un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).send({ status: "éxito", payload: newCart });
    } catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor al crear carrito." });
    }
});

// GET /api/carts/:cid - Lista los productos de un carrito
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);

        if (!cart) {
            return res.status(404).send({ status: "error", error: "Carrito no encontrado." });
        }

        res.send({ status: "éxito", payload: cart.products }); // La consigna pide listar SÓLO los productos
    } catch (error) {
        console.error("Error al obtener carrito:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor al obtener carrito." });
    }
});

// POST /api/carts/:cid/product/:pid - Agrega un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        // No necesitamos validar el body aca, ya que el PID viene por URL.
        const updatedCart = await cartManager.addProductToCart(cid, pid);

        res.send({ status: "éxito", payload: updatedCart });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).send({ status: "error", error: error.message });
        }
        console.error("Error al agregar producto al carrito:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor." });
    }
});

export default router;