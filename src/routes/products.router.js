import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// Endpoint para obtener todos los productos (GET /api/products)
router.get('/', async (req, res) => {
    try {
        // En este punto, getProducts() solo devuelve el array puro.
        const products = await productManager.getProducts();

        // El router envuelve la respuesta en el formato de éxito estándar.
        res.send({ status: 'éxito', payload: products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send({
            status: "error",
            error: "Error interno del servidor al obtener productos"
        });
    }
});

// Endpoint para obtener un producto por ID (GET /api/products/:pid)
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);

        if (!product) {
            return res.status(404).send({ status: "error", error: "Producto no encontrado." });
        }

        res.send({ status: 'éxito', payload: product });
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor." });
    }
});

// Endpoint para agregar un nuevo producto (POST /api/products)
router.post('/', async (req, res) => {
    try {
        const newProductData = req.body;
        
        // El Manager se encarga de las validaciones y de generar el ID único
        const newProduct = await productManager.addProduct(newProductData);

        // 201 Created para indicar que el recurso fue creado exitosamente
        res.status(201).send({ status: "éxito", payload: newProduct });
    } catch (error) {
        // 400 Bad Request para errores de validación (ej: campos faltantes, código repetido)
        console.error("Error al agregar producto:", error.message);
        res.status(400).send({ status: "error", error: error.message });
    }
});

// Endpoint para actualizar un producto (PUT /api/products/:pid)
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const fieldsToUpdate = req.body;

        const updatedProduct = await productManager.updateProduct(pid, fieldsToUpdate);
        
        res.send({ status: "éxito", payload: updatedProduct });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).send({ status: "error", error: error.message });
        }
        // 400 para errores de validación (ej: intentar cambiar el ID)
        res.status(400).send({ status: "error", error: error.message });
    }
});

// Endpoint para eliminar un producto (DELETE /api/products/:pid)
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        
        await productManager.deleteProduct(pid);
        
        res.send({ status: "éxito", message: `Producto con ID ${pid} eliminado correctamente.` });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).send({ status: "error", error: error.message });
        }
        console.error("Error al eliminar producto:", error);
        res.status(500).send({ status: "error", error: "Error interno del servidor." });
    }
});

// aca es donde van a ir las rutas POST, PUT, DELETE y GET por ID!

export default router;