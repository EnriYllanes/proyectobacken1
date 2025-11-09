import { Router } from 'express';
import ProductService from '../dao/Product.service.js';

const router = Router();
const productService = ProductService;

// Función auxiliar para construir el link
const buildLink = (baseUrl, page, limit, sort, query) => {
    // Reconstruye la URL base sin 'page'
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (sort) params.set('sort', sort);
    // Añadir el query de manera genérica
    if (query) {
        // query puede ser complejo (category=X, status=Y), lo manejamos en el router
        for (const key in query) {
            params.set(key, query[key]);
        }
    }
    
    // Si la página es válida (mayor que 0), la incluimos
    if (page && page > 0) {
        params.set('page', page);
    } else if (page === null) {
        return null;
    }

    return `${baseUrl}?${params.toString()}`;
};

// GET /api/products
// Recibe: limit, page, sort, query
router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, ...query } = req.query; // Captura el resto como 'query'

        const options = { limit, page, sort, query };

        // Obtener resultados paginados del servicio
        const result = await productService.getPaginatedProducts(options);
        
        // Determinar la URL base (asumiendo que la ruta es '/api/products')
        // req.baseUrl es '/api', req.path es '/products', pero para los links solo necesitamos el path base: '/api/products'
        const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`; 

        // Construir los links
        const prevLinkPage = result.prevPage ? result.prevPage : null;
        const nextLinkPage = result.nextPage ? result.nextPage : null;
        
        const prevLink = result.hasPrevPage
            ? buildLink(baseUrl, prevLinkPage, limit, sort, query)
            : null;

        const nextLink = result.hasNextPage
            ? buildLink(baseUrl, nextLinkPage, limit, sort, query)
            : null;


        // Devolver el objeto con el formato solicitado
        res.status(200).json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
        });

    } catch (error) {
        console.error('Error al obtener productos paginados:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener productos.', error: error.message });
    }
});

// GET /api/products/:pid (sin cambios, para llevar a la vista de detalle)
router.get('/:pid', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.pid);
        res.status(200).json({ status: 'success', payload: product });
    } catch (error) {
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({ status: 'error', message: error.message });
        }
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
});

// Aquí irían tus rutas POST, PUT, DELETE para productos, si es que las tienes

export default router;