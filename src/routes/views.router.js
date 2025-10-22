import { Router } from 'express';
// asegurar de que la ruta a tu ProductManager sea correcta
import ProductManager from '../../src/managers/ProductManager.js'; 

const router = Router();
// Instanciamos el manager (asumiendo que recibe la ruta al archivo JSON)
const productManager = new ProductManager('products.json'); 

// Ruta: /
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza 'home.handlebars' y le pasa el array de productos
        res.render('home', { products: products });
    } catch (error) {
        res.status(500).send('Error al cargar la vista Home.');
    }
});

// Ruta: /realtimeproducts
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza 'realTimeProducts.handlebars' y le pasa la lista inicial
        res.render('realTimeProducts', { products: products });
    } catch (error) {
        res.status(500).send('Error al cargar la vista de Productos en Tiempo Real.');
    }
});

export default router;