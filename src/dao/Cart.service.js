import CartModel from '../models/Cart.model.js';
// ⚠️ Importamos el ProductModel, que internamente Mongoose ha registrado como 'products'
import ProductModel from '../models/Product.model.js'; 

class CartService {

    // Helper para realizar el populate en las consultas
    #populateOptions = {
        path: 'products.product', 
        model: ProductModel,      
        // 🔑 CLAVE: Mongoose necesita saber qué colección (o modelo) buscar. 
        // Como tu ProductModel se exporta con la referencia 'products', lo usamos.
        select: 'title description price' 
    };

    // 1. Crear Carrito (POST /api/carts)
    async createCart() {
        try {
            const newCart = await CartModel.create({ products: [] });
            return newCart;
        } catch (error) {
            console.error("Error al crear carrito:", error);
            throw new Error("Fallo al crear el carrito en Mongoose.");
        }
    }

    // 2. Obtener Carrito por ID con Populate (GET /api/carts/:cid)
    async getCartById(cid) {
        try {
            const cart = await CartModel.findById(cid)
                .populate(this.#populateOptions)
                .lean();

            if (!cart) {
                throw new Error(`Cart not found with ID: ${cid}`);
            }
            return cart;
        } catch (error) {
            console.error("Error al obtener carrito por ID:", error);
            throw error;
        }
    }

    // 3. Agregar Producto al Carrito (POST /api/carts/:cid/products/:pid)
    async addProductToCart(cid, pid, quantity = 1) {
        try {
            const cart = await CartModel.findById(cid);
            if (!cart) {
                throw new Error(`Cart not found with ID: ${cid}`);
            }

            // 3.1 Buscar si el producto ya existe en el carrito
            // Usamos .toString() para comparar el ObjectId con el pid (string)
            const productIndex = cart.products.findIndex(item => item.product.toString() === pid);

            if (productIndex !== -1) {
                // 3.2 Si existe, solo incrementamos la cantidad
                cart.products[productIndex].quantity += quantity;
            } else {
                // 3.3 Si no existe, lo agregamos como nuevo
                cart.products.push({ product: pid, quantity: quantity });
            }

            // 3.4 Guardamos los cambios
            await cart.save();

            // 3.5 Devolvemos el carrito actualizado con populate
            return this.getCartById(cid); 
        } catch (error) {
            console.error("Error al agregar producto:", error);
            throw error;
        }
    }

    // 4. Eliminar Producto del Carrito (DELETE /api/carts/:cid/products/:pid)
    async removeProductFromCart(cid, pid) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(
                cid,
                { $pull: { products: { product: pid } } }, 
                { new: true }
            );

            if (!updatedCart) {
                throw new Error(`Cart not found with ID: ${cid}`);
            }
            return this.getCartById(cid);
        } catch (error) {
            console.error("Error al remover producto:", error);
            throw error;
        }
    }

    // 5. Actualizar Carrito con Array Completo (PUT /api/carts/:cid)
    async updateAllProducts(cid, productsArray) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(
                cid,
                { $set: { products: productsArray } },
                { new: true, runValidators: true } 
            );

            if (!updatedCart) {
                throw new Error(`Cart not found with ID: ${cid}`);
            }
            return this.getCartById(cid);
        } catch (error) {
            console.error("Error al actualizar array de productos:", error);
            throw error;
        }
    }

    // 6. Actualizar Cantidad de Producto (PUT /api/carts/:cid/products/:pid)
    async updateProductQuantity(cid, pid, quantity) {
        try {
            const updatedCart = await CartModel.findOneAndUpdate(
                { _id: cid, "products.product": pid }, 
                { $set: { "products.$.quantity": quantity } }, 
                { new: true }
            );

            if (!updatedCart) {
                throw new Error(`Cart or Product not found in cart.`);
            }
            return this.getCartById(cid);
        } catch (error) {
            console.error("Error al actualizar cantidad:", error);
            throw error;
        }
    }

    // 7. Vaciar Carrito Completo (DELETE /api/carts/:cid)
    async clearCart(cid) {
        try {
            const updatedCart = await CartModel.findByIdAndUpdate(
                cid,
                { $set: { products: [] } },
                { new: true }
            );
            
            if (!updatedCart) {
                throw new Error(`Cart not found with ID: ${cid}`);
            }
            return updatedCart;
        } catch (error) {
            console.error("Error al vaciar carrito:", error);
            throw error;
        }
    }
}

export default new CartService();