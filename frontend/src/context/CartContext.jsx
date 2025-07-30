import { createContext, useContext, useState, useEffect } from "react";
import useFetchList from "../hooks/useFetchList";
const CartContext = createContext();

export function CartProvider({ children }) {
    const STORAGE_KEY = "cart";
    const { data: items } = useFetchList("items", "items_cache")
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem(STORAGE_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Failed to read shopping cart from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save shopping cart to localStorage", error);
        }
    }, [cart]);

    // requires quantity to be >=1
    function changeCartItem(product, quantity) {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
    }

    // requires quantity to be >=1
    function addCartItem(product, quantity) {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity }];
            }
        });
    }

    function removeFromCart(productId) {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }

    function clearCart() {
        setCart([]);
    }

    function createCartFromSimplified(simplifiedCart) {
        // simplifiedCart in form [{id:..., qty:...}, ...]
        return simplifiedCart.map((item) => ({
            ...items.find(product => product.id === item.id),
            quantity: item.qty
        }));
    }

    function compareCarts(prev, curr) {

    }

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart,
                addCartItem,
                changeCartItem,
                removeFromCart,
                clearCart,
                createCartFromSimplified
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useShoppingCart() {
    return useContext(CartContext);
}