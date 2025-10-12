import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// Obtención de ruta absoluta para resolver problemas de path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apunta a products.json, asumiendo que está dos niveles arriba (en la raíz)
const PRODUCTS_FILE_PATH = path.resolve(__dirname, '../../products.json');

class ProductManager {
    constructor() {
        this.path = PRODUCTS_FILE_PATH;
    }

    // Asegura que el archivo exista y esté inicializado con []
    async #ensureFile() {
        try {
            await fs.access(this.path);
        } catch (error) {
            await fs.writeFile(this.path, '[]', 'utf-8');
        }
    }

    // Método privado para leer el contenido del archivo JSON
    async #readProducts() {
        await this.#ensureFile(); 
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            if (data.trim() === "" || data.trim() === "null") {
                await fs.writeFile(this.path, '[]', 'utf-8');
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error("[ProductManager ERROR] Falló la lectura/parseo:", error.message);
            return [];
        }
    }

    // Método privado para escribir el contenido en el archivo JSON
    async #saveProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2), 'utf-8');
    }

    // [GET /] Lista todos los productos
    async getProducts() {
        return await this.#readProducts();
    }

    // [GET /:pid] Trae un producto por ID
    async getProductById(id) {
        const products = await this.#readProducts();
        return products.find(p => p.id === id); 
    }

    // [POST /] Agrega un nuevo producto
    async addProduct(product) {
        const products = await this.#readProducts();

        // Validaciones de campos obligatorios
        const { title, description, code, price, stock, category } = product;
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error("Faltan campos obligatorios (title, description, code, price, stock, category).");
        }
        
        // Validación de código único
        if (products.some(p => p.code === code)) {
            throw new Error(`El código ${code} ya existe.`);
        }

        const newProduct = {
            id: randomUUID(), // ID autogenerado
            title, description, code, price: Number(price), 
            status: product.status !== undefined ? Boolean(product.status) : true, 
            stock: Number(stock), 
            category,
            thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [] 
        };

        products.push(newProduct);
        await this.#saveProducts(products);
        return newProduct;
    }

    // [PUT /:pid] Actualiza un producto
    async updateProduct(id, fieldsToUpdate) {
        const products = await this.#readProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }

        // NO se permite actualizar el 'id'
        if (fieldsToUpdate.id) {
            delete fieldsToUpdate.id;
        }

        const currentProduct = products[index];

        // Manejar el code: si se actualiza, debe ser único (y no ser el code del producto actual)
        if (fieldsToUpdate.code && fieldsToUpdate.code !== currentProduct.code) {
            if (products.some(p => p.code === fieldsToUpdate.code)) {
                throw new Error(`El código ${fieldsToUpdate.code} ya está en uso por otro producto.`);
            }
        }
        
        // Actualiza el producto manteniendo los campos existentes
        const updatedProduct = {
            ...currentProduct,
            ...fieldsToUpdate,
            // Asegurar que price y stock son números, status es booleano
            price: fieldsToUpdate.price !== undefined ? Number(fieldsToUpdate.price) : currentProduct.price,
            stock: fieldsToUpdate.stock !== undefined ? Number(fieldsToUpdate.stock) : currentProduct.stock,
            status: fieldsToUpdate.status !== undefined ? Boolean(fieldsToUpdate.status) : currentProduct.status,
        };

        products[index] = updatedProduct;
        await this.#saveProducts(products);
        return updatedProduct;
    }

    // [DELETE /:pid] Elimina un producto
    async deleteProduct(id) {
        let products = await this.#readProducts();
        const initialLength = products.length;

        products = products.filter(p => p.id !== id);

        if (products.length === initialLength) {
            throw new Error(`Producto con id ${id} no encontrado para eliminar.`);
        }

        await this.#saveProducts(products);
        return true;
    }
}

export default ProductManager;