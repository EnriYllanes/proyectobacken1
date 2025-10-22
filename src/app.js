import express from 'express';
import handlebars from 'express-handlebars'; // 1. Importar Handlebars
import { Server } from 'socket.io';          // 2. Importar Server de Socket.IO
import http from 'http';                      // 3. Importar módulo http
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; // 4. Nuevo Router para las Vistas
import ProductManager from './managers/ProductManager.js'; 


const app = express();
const PORT = 8080;

const productManager = new ProductManager('products.json');

// Crea el servidor HTTP nativo usando la aplicación Express
const httpServer = http.createServer(app); 

// Crea el servidor de Socket.IO y adjuntarlo al servidor HTTP
const io = new Server(httpServer); 

// --- Configuración de Handlebars ---
app.engine('handlebars', handlebars.engine());
app.set('views', 'views'); // La carpeta 'views' contiene los archivos .handlebars
app.set('view engine', 'handlebars');
// -----------------------------------

// --- Middlewares y Archivos estáticos ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Agrego esta línea para servir los archivos estáticos (CSS, JS del cliente)
app.use(express.static('public')); 
// ----------------------------------------

// --- Rutas ---
// Rutas de API (devuelven JSON)
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);

// Ruta de Vistas (devuelven HTML renderizado por Handlebars)
app.use('/', viewsRouter); 

// --- Lógica de Sockets ---
io.on('connection', socket => {
    console.log('🔗 ¡Nuevo cliente conectado por WebSocket!');

    // aca irá la lógica para escuchar los eventos 'addProduct' y 'deleteProduct'
    // y emitir 'updateProducts' (Ver Seccion 4).
    
    socket.on('disconnect', () => {
        console.log('Cliente desconectado.');
    });

    // 1. Enviar la lista inicial al conectarse
    productManager.getProducts().then(products => {
        socket.emit('updateProducts', products); 
    });

    // 2. Recepción para Agregar Producto
    socket.on('addProduct', async (productData) => {
        try {
            // Llama al ProductManager para agregar
            await productManager.addProduct(productData); 
            // Obtiene la lista actualizada
            const updatedProducts = await productManager.getProducts();
            // Notifica a *todos* los clientes para que actualicen su lista
            io.emit('updateProducts', updatedProducts); 
        } catch (error) {
            console.error('Error al agregar producto por socket:', error);
        }
    });

    // 3. Recepción para Eliminar Producto
    socket.on('deleteProduct', async (productId) => {
        try {
            // Llama al ProductManager para eliminar
            await productManager.deleteProduct(productId); 
            // Obtiene la lista actualizada
            const updatedProducts = await productManager.getProducts();
            // Notifica a *todos* los clientes para que actualicen su lista
            io.emit('updateProducts', updatedProducts); 
        } catch (error) {
            console.error('Error al eliminar producto por socket:', error);
        }
    });

});
// -------------------------

// Inicialización del servidor (Usamos httpServer en lugar de app.listen)
httpServer.listen(PORT, () => {
    console.log(` Servidor escuchando en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    // Añadimos las nuevas rutas de vista:
    console.log(`Vistas disponibles:`);
    console.log(`  - Home: /`);
    console.log(`  - Productos en Tiempo Real: /realtimeproducts`);
});