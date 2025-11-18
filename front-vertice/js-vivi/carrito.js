/**
 * Carrito.js - Página de visualización y gestión del carrito
 */

const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadCartPage();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón de checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Botón de vaciar carrito
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', handleClearCart);
    }

    // Event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quantity-btn-plus')) {
            const productId = e.target.closest('.cart-item').dataset.productId;
            handleQuantityChange(productId, 1);
        }
        
        if (e.target.closest('.quantity-btn-minus')) {
            const productId = e.target.closest('.cart-item').dataset.productId;
            handleQuantityChange(productId, -1);
        }
        
        if (e.target.closest('.remove-btn')) {
            const productId = e.target.closest('.cart-item').dataset.productId;
            handleRemoveItem(productId);
        }
    });

    // Botón del carrito en header
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            window.location.href = './consumidor.carrito.html';
        });
    }
}

async function loadCartPage() {
    const cart = window.cartManager.getCart();
    
    if (!cart || cart.items.length === 0) {
        showEmptyCart();
        return;
    }

    // Agrupar productos por comerciante
    const productsByCommerceMap = await groupProductsByCommerce(cart.items);
    
    // Verificar si todos los productos son del mismo comerciante
    const commerceIds = Object.keys(productsByCommerceMap);
    
    if (commerceIds.length === 0) {
        showEmptyCart();
        return;
    }
    
    if (commerceIds.length > 1) {
        window.notify.warning('Solo puedes realizar pedidos de un comerciante a la vez. Por favor, vacía tu carrito y selecciona productos de un solo comercio.', 6000);
        showEmptyCart();
        return;
    }

    // Mostrar contenido del carrito
    const commerceId = commerceIds[0];
    const commerceData = productsByCommerceMap[commerceId];
    
    displayCart(cart, commerceData);
}

async function groupProductsByCommerce(cartItems) {
    const grouped = {};
    
    for (const item of cartItems) {
        try {
            // Obtener información del producto desde la API
            const response = await fetch(`${API_URL}/productos/${item.id}`);
            if (response.ok) {
                const data = await response.json();
                const product = data.data || data;
                
                const commerceId = product.user_id;
                
                if (!grouped[commerceId]) {
                    grouped[commerceId] = {
                        commerceId: commerceId,
                        commerceName: product.usuario?.username || 'Comerciante',
                        items: []
                    };
                }
                
                grouped[commerceId].items.push({
                    ...item,
                    fullProductData: product
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }
    
    return grouped;
}

function displayCart(cart, commerceData) {
    document.getElementById('cart-empty').style.display = 'none';
    document.getElementById('cart-content').style.display = 'grid';
    
    // Mostrar información del comerciante
    const commerceInfo = document.getElementById('comerciante-info');
    const commerceName = document.getElementById('comerciante-nombre');
    if (commerceInfo && commerceName) {
        commerceInfo.style.display = 'block';
        commerceName.textContent = commerceData.commerceName;
    }
    
    // Renderizar items
    const cartItemsList = document.getElementById('cart-items-list');
    cartItemsList.innerHTML = '';
    
    let subtotal = 0;
    
    commerceData.items.forEach(item => {
        const itemTotal = item.precio * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = createCartItemElement(item, itemTotal);
        cartItemsList.appendChild(cartItemElement);
    });
    
    // Actualizar resumen
    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${subtotal.toFixed(2)}`;
    
    // Guardar commerceId para checkout
    document.getElementById('checkout-btn').dataset.commerceId = commerceData.commerceId;
}

function createCartItemElement(item, itemTotal) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.productId = item.id;
    
    const imageUrl = item.imagen || './assets/imgs/placeholder.png';
    
    div.innerHTML = `
        <img src="${imageUrl}" alt="${item.nombre}" class="cart-item-image" />
        <div class="cart-item-details">
            <div class="cart-item-name">${item.nombre}</div>
            <div class="cart-item-price">$${item.precio.toFixed(2)}</div>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn quantity-btn-minus" ${item.quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn quantity-btn-plus">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <button class="remove-btn" title="Eliminar">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return div;
}

function handleQuantityChange(productId, delta) {
    const cart = window.cartManager.getCart();
    const item = cart.items.find(i => i.id === productId);
    
    if (item) {
        const newQuantity = item.quantity + delta;
        
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        
        window.cartManager.updateQuantity(productId, newQuantity);
        loadCartPage(); // Recargar la página
    }
}

function handleRemoveItem(productId) {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
        window.cartManager.removeItem(productId);
        loadCartPage(); // Recargar la página
    }
}

function handleClearCart() {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
        window.cartManager.clearCart();
        showEmptyCart();
    }
}

function handleCheckout() {
    const cart = window.cartManager.getCart();
    
    if (!cart || cart.items.length === 0) {
        window.notify.warning('Tu carrito está vacío');
        return;
    }
    
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
        window.notify.error('Debes iniciar sesión para realizar un pedido');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return;
    }
    
    // Redirigir a la página de selección de pickup
    window.location.href = './consumidor.elegir-pickup.html';
}

function showEmptyCart() {
    document.getElementById('cart-empty').style.display = 'block';
    document.getElementById('cart-content').style.display = 'none';
}
