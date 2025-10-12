import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARTS_FILE_PATH = path.resolve(__dirname, '../../carts.json'); // Apunta a carts.json en la raíz

class CartManager {
    constructor() {
        this.path = CARTS_FILE_PATH;
    }

    // Asegura que el archivo exista y esté inicializado con []
    async #ensureFile() {
        try {
            await fs.access(this.path);
        } catch (error) {
            await fs.writeFile(this.path, '[]', 'utf-8');
        }
    }

    async #readCarts() {
        await this.#ensureFile();
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            if (data.trim() === "" || data.trim() === "null") {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error("[CartManager ERROR] Falló la lectura/analizar (JSON inválido):", error.message);
            return [];
        }
    }

    async #saveCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2), 'utf-8');
    }

    // [POST /] Crea un nuevo carrito
    async createCart() {
        const carts = await this.#readCarts();
        const newCart = {
            id: randomUUID(), // ID autogenerado
            products: [] // Array vacío
        };

        carts.push(newCart);
        await this.#saveCarts(carts);
        return newCart;
    }

    // [GET /:cid] Obtiene un carrito por ID
    async getCartById(id) {
        const carts = await this.#readCarts();
        return carts.find(c => c.id === id); 
    }

    // [POST /:cid/product/:pid] Agrega un producto al carrito
    async addProductToCart(cid, pid) {
        const carts = await this.#readCarts();
        const cartIndex = carts.findIndex(c => c.id === cid);

        if (cartIndex === -1) {
            throw new Error(`Carrito con id ${cid} no encontrado.`);
        }

        const cart = carts[cartIndex];
        // aca el product solo contiene el ID, quantity es 1 por defecto (consigna)
        const existingProductIndex = cart.products.findIndex(p => p.product === pid); 

        if (existingProductIndex > -1) {
            // Producto existe: incrementa la cantidad
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // Producto NO existe: agrégalo
            cart.products.push({
                product: pid,
                quantity: 1
            });
        }

        carts[cartIndex] = cart;
        await this.#saveCarts(carts);
        return cart;
    }
}

export default CartManager;