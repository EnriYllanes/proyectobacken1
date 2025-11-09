// IMPORTANTE: Para que esto funcione, debo tener un 'cartId' disponible.
// Reemplaza 'TU_ID_REAL_DE_CARRITO_MONGO' con el ID que obtuviste de Postman.
const USER_CART_ID = localStorage.getItem('userCartId') || '6910e022b262bb78f51ca1ba'; 

// 🚨 NO USAR alert(). Usamos una función para mostrar mensajes en un modal o div.
function showMessage(type, message) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // En una aplicación real, esta función mostraría un modal de Bootstrap o un Toast
    // Por ahora, usamos console.log para cumplir con la restricción de no usar alert().
    // Puedes implementar un modal simple si lo deseas.
    
    // Implementación simple para un entorno de prueba:
    const statusDiv = document.getElementById('status-message');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `p-2 my-2 rounded text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
        setTimeout(() => statusDiv.textContent = '', 3000);
    }
}

// ----------------------------------------------------------------------
// A. AGREGAR PRODUCTO AL CARRITO (usado en views/products.handlebars)
// ----------------------------------------------------------------------
async function addToCart(productId) {
    if (!USER_CART_ID || USER_CART_ID === 'ID_DE_UN_CARRITO_DE_PRUEBA_EXISTENTE') {
        showMessage('error', "Error: ID de carrito no configurado. Crea un carrito y asigna el ID.");
        return;
    }

    try {
        const response = await fetch(`/api/carts/${USER_CART_ID}/products/${productId}`, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: 1 }), 
        });

        if (response.ok) {
            showMessage('success', '✅ Producto agregado al carrito!');
        } else {
            const data = await response.json();
            showMessage('error', `❌ Error al agregar producto: ${data.error || data.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage('error', 'Ocurrió un error de conexión.');
    }
}

// ----------------------------------------------------------------------
// B. ELIMINAR UN PRODUCTO ESPECÍFICO (usado en views/cart.handlebars)
// ----------------------------------------------------------------------
async function removeProduct(cartId, productId) {
    // 🚨 Usamos una función personalizada para reemplazar confirm()
    if (!await customConfirm('¿Estás seguro de que deseas quitar este producto del carrito?')) {
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showMessage('success', '✅ Producto eliminado del carrito!');
            window.location.reload(); 
        } else {
            const data = await response.json();
            showMessage('error', `❌ Error al eliminar: ${data.error || data.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage('error', 'Ocurrió un error de conexión.');
    }
}

// ----------------------------------------------------------------------
// C. VACIAR EL CARRITO COMPLETO (usado en views/cart.handlebars)
// ----------------------------------------------------------------------
async function clearCart(cartId) {
    // 🚨 Usamos una función personalizada para reemplazar confirm()
    if (!await customConfirm('⚠️ ¿Estás seguro de que deseas vaciar todo el carrito?')) {
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showMessage('success', '✅ Carrito vaciado exitosamente!');
            window.location.reload(); 
        } else {
            const data = await response.json();
            showMessage('error', `❌ Error al vaciar carrito: ${data.error || data.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage('error', 'Ocurrió un error de conexión.');
    }
}

// ----------------------------------------------------------------------
// D. Funciones de reemplazo para alert() y confirm()
// ----------------------------------------------------------------------

// Reemplazo de window.confirm con una promesa para simular un modal
function customConfirm(message) {
    return new Promise(resolve => {
        // En un entorno de desarrollo, si no tienes un modal, la forma más simple es
        // simular la confirmación automática para evitar que el proceso se detenga.
        // Si necesitas la interacción real, debes construir un modal HTML/CSS/JS.
        
        // Simulación: siempre resuelve a true para no interrumpir el flujo.
        console.warn(`[CONFIRMACIÓN REQUERIDA] ${message}. Asumiendo 'Sí' para continuar.`);
        resolve(true); 
    });
}