/**
 * Cart Persistence Module
 * Manages cart state across all consumer pages using localStorage
 */

class CartManager {
    constructor() {
        this.storageKey = 'vertice_cart';
        this.countElement = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready before trying to get the count element
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.countElement = document.getElementById('cart-count');
                this.updateCartDisplay();
            });
        } else {
            this.countElement = document.getElementById('cart-count');
            this.updateCartDisplay();
        }
        
        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.updateCartDisplay();
            }
        });

        // Listen for custom cart update events within same page
        window.addEventListener('cartUpdated', () => {
            this.updateCartDisplay();
        });
    }

    getCart() {
        try {
            const cart = localStorage.getItem(this.storageKey);
            return cart ? JSON.parse(cart) : { items: [], count: 0 };
        } catch (error) {
            console.error('Error loading cart:', error);
            return { items: [], count: 0 };
        }
    }

    saveCart(cart) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(cart));
            this.updateCartDisplay();
            
            // Dispatch event to notify other parts of the page
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    addItem(product) {
        const cart = this.getCart();
        
        // Check if item already exists
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                id: product.id,
                nombre: product.nombre_producto,
                precio: product.precio_descuento || product.precio_original,
                imagen: product.imagenes?.[0] || '',
                quantity: 1
            });
        }
        
        cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
        this.saveCart(cart);
        
        return cart;
    }

    removeItem(productId) {
        const cart = this.getCart();
        cart.items = cart.items.filter(item => item.id !== productId);
        cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
        this.saveCart(cart);
        
        return cart;
    }

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
            cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
            this.saveCart(cart);
        }
        
        return cart;
    }

    clearCart() {
        const emptyCart = { items: [], count: 0 };
        this.saveCart(emptyCart);
        return emptyCart;
    }

    getItemCount() {
        const cart = this.getCart();
        return cart.count || 0;
    }

    updateCartDisplay() {
        // Try to get the element if we don't have it yet
        if (!this.countElement) {
            this.countElement = document.getElementById('cart-count');
        }
        
        if (this.countElement) {
            const count = this.getItemCount();
            this.countElement.textContent = count;
            // Badge siempre visible - no se oculta nunca
        }
    }
}

// Initialize cart manager immediately
const cartManager = new CartManager();

// Export for use in other scripts
window.CartManager = CartManager;
window.cartManager = cartManager;

console.log('Cart Manager initialized:', window.cartManager);

