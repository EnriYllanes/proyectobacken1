import ProductModel from '../models/Product.model.js';

class ProductService {

    // 1. Método que implementa paginación, filtros y ordenamiento.
    async getPaginatedProducts(options) {
        // Desestructurar opciones con valores predeterminados
        const { limit = 10, page = 1, sort, query } = options;

        // 1. Configurar el objeto de filtros (query)
        let filter = {};
        if (query) {
            // Permitir búsqueda por categoría o por estado (status)
            if (query.category) {
                filter.category = query.category;
            }
            // Suponemos que el filtro por disponibilidad se hace por 'status: true'
            if (query.status !== undefined) {
                // Convertir la cadena 'true'/'false' a booleano
                filter.status = query.status === 'true';
            }
        }

        // 2. Configurar el objeto de ordenamiento (sort)
        let sortOptions = {};
        if (sort === 'asc') {
            sortOptions.price = 1; // 1 = ascendente
        } else if (sort === 'desc') {
            sortOptions.price = -1; // -1 = descendente
        }
        
        // 3. Configurar las opciones para el plugin mongoose-paginate-v2
        const paginateOptions = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sortOptions,
            lean: true // Importante para obtener objetos JS planos
        };

        // 4. Ejecutar la paginación
        const result = await ProductModel.paginate(filter, paginateOptions);

        return result;
    }

    // Método de soporte para obtener un solo producto (asumiendo que ya existía)
    async getProductById(pid) {
        const product = await ProductModel.findById(pid).lean();
        if (!product) {
            throw new Error(`Producto con ID ${pid} no encontrado.`);
        }
        return product;
    }

    // Aquí irían tus otros métodos: createProduct, updateProduct, deleteProduct, etc.
}

export default new ProductService();