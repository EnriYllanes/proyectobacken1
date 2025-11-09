import { Router } from 'express';
import ProductService from '../dao/Product.service.js';
import CartService from '../dao/Cart.service.js';

const router = Router();
const productService = ProductService;
const cartService = CartService;

// VISTA PRINCIPAL DE PRODUCTOS CON PAGINACIÓN Y FILTROS
router.get('/products', async (req, res) => {
    try {
        // Recibe y usa los mismos parámetros que el API
        const { limit, page, sort, ...query } = req.query; 
        const options = { limit, page, sort, query };

        const result = await productService.getPaginatedProducts(options);

        // La URL base para construir los links. Usamos req.originalUrl para capturar
        // los parámetros de consulta originales (limit, sort, query)
        const baseUrl = req.protocol + '://' + req.get('host') + req.baseUrl + req.path;

        // Pasamos toda la estructura de mongoose-paginate-v2 a la vista
        const responseData = {
            ...result, // payload (docs), totalPages, page, etc.
            
            // Reemplazamos 'docs' por 'payload' para claridad en el frontend
            payload: result.docs, 
            
            // Construir links específicos para la vista
            prevLink: result.hasPrevPage 
                ? `${baseUrl}?page=${result.prevPage}&limit=${limit || 10}${sort ? '&sort=' + sort : ''}`
                : null,
            
            nextLink: result.hasNextPage 
                ? `${baseUrl}?page=${result.nextPage}&limit=${limit || 10}${sort ? '&sort=' + sort : ''}`
                : null,
        };

        res.render('products', responseData);

    } catch (error) {
        console.error("Error al renderizar productos:", error);
        res.status(500).render('error', { error: "Error al cargar la vista de productos." });
    }
});

// NUEVA VISTA DE CARRITO CON POPULATE
router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        // La función getCartById ya usa populate internamente
        const cart = await cartService.getCartById(cartId);

        if (!cart) {
            return res.status(404).render('error', { error: `Carrito con ID ${cartId} no encontrado.` });
        }

        // Renderiza la vista del carrito.
        // Los productos en cart.products ya vendrán con el detalle completo gracias al populate.
        res.render('cart', { cart: cart }); 

    } catch (error) {
        console.error("Error al renderizar carrito:", error);
        // Si hay un CastError (ID incorrecto), lo manejamos aquí
        const errorMessage = error.name === 'CastError' 
            ? 'ID de carrito inválido.' 
            : 'Error interno del servidor.';
            
        res.status(500).render('error', { error: errorMessage });
    }
});

// VISTA DE DETALLE DE PRODUCTO (Opcional, si la implementaste)
// router.get('/products/:pid', async (req, res) => { ... });

export default router;