import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;

// Middleware para parsear el body de las peticiones (JSON)
app.use(express.json());
// Middleware para parsear datos de formularios (ej. x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));


// Rutas para los endpoints
app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando! endpoints disponibles /api/products y /api/carts.');
});


// Inicialización del servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Endpoints disponibles:`);
    console.log(`  - Productos: /api/products`);
    console.log(`  - Carritos: /api/carts`);
});