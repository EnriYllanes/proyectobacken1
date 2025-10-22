const socket = io(); // Inicia la conexión con el servidor Socket.IO
const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');

// Función que renderiza la lista completa en el DOM
const renderProducts = (products) => {
    productList.innerHTML = products.map(p => 
        `<li id="product-${p.id}">
            <strong>${p.title}</strong> (${p.code}) - $${p.price}
            <button onclick="deleteProduct('${p.id}')" style="margin-left: 10px;">Eliminar</button>
            <br>
            Stock: ${p.stock} | ID: ${p.id}
        </li>`
    ).join('');
};

// 1. Escuchar el evento de actualización inicial y continua del servidor
socket.on('connect', () => {
    // Cuando el cliente se conecta o el servidor actualiza, pedimos la lista
    socket.on('updateProducts', (products) => {
        renderProducts(products);
    });
});


// 2. Manejo del formulario de creación (Envío de datos vía WebSocket)
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Recolectar datos del formulario
    const newProduct = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        status: true,
        thumbnails: []
    };
    
    // Emitir el evento al servidor
    socket.emit('addProduct', newProduct); 
    productForm.reset();
});

// 3. Función de eliminación (Llamada desde el botón en la lista)
window.deleteProduct = (productId) => {
    socket.emit('deleteProduct', productId);
};

// Ejecutar el render inicial con la lista que Handlebars pasa al script (opcional pero bueno para la carga inicial)
// renderProducts({{products}}); // Esto requiere que el script sea embebido, usaremos el socket para la lista inicial.