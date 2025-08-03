import { createContext, useContext, useReducer, useEffect, useMemo } from "react";
import useFetchList from "../hooks/useFetchList";

const CartContext = createContext();

function cartReducer(state, action) {
    switch (action.type) {
        case 'SET_CART':
            return action.payload;
        
        case 'ADD_ITEM': {
            const { product, quantity } = action.payload;
            const existing = state.find(item => item.id === product.id);
            
            if (existing) {
                return state.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...state, { ...product, quantity }];
        }
        
        case 'CHANGE_ITEM': {
            const { product, quantity } = action.payload;
            const existing = state.find(item => item.id === product.id);
            
            if (existing) {
                return state.map(item =>
                    item.id === product.id
                        ? { ...item, quantity }
                        : item
                );
            }
            return [...state, { ...product, quantity }];
        }
        
        case 'REMOVE_ITEM':
            return state.filter(item => item.id !== action.payload);
        
        case 'CLEAR_CART':
            return [];
        
        case 'CREATE_FROM_SIMPLIFIED': {
            const { simplifiedCart, items } = action.payload;
            return simplifiedCart.map(item => ({
                ...items.find(product => product.id === item.id),
                quantity: item.qty
            })).filter(item => item.id !== undefined);
        }
        
        default:
            return state;
    }
}

export function CartProvider({ children }) {
    const STORAGE_KEY = "cart";
    const { data: items = [] } = useFetchList("items", "items_cache");
    
    const initialCart = useMemo(() => {
        try {
            const storedCart = localStorage.getItem(STORAGE_KEY);
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error("Failed to read shopping cart from localStorage", error);
            return [];
        }
    }, []);
    
    const [cart, dispatch] = useReducer(cartReducer, initialCart);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error("Failed to save shopping cart to localStorage", error);
        }
    }, [cart]);

    const cartActions = useMemo(() => ({
        addCartItem: (product, quantity) => 
            dispatch({ type: 'ADD_ITEM', payload: { product, quantity } }),
        
        changeCartItem: (product, quantity) => 
            dispatch({ type: 'CHANGE_ITEM', payload: { product, quantity } }),
        
        removeFromCart: (productId) => 
            dispatch({ type: 'REMOVE_ITEM', payload: productId }),
        
        clearCart: () => 
            dispatch({ type: 'CLEAR_CART' }),
        
        setCart: (newCart) => 
            dispatch({ type: 'SET_CART', payload: newCart }),
        
        createCartFromSimplified: (simplifiedCart) => {
            const newCart = simplifiedCart.map(item => ({
                ...items.find(product => product.id === item.id),
                quantity: item.qty
            })).filter(item => item.id !== undefined);
            dispatch({ type: 'SET_CART', payload: newCart });
            return newCart;
        }
    }), [items]);

    const contextValue = useMemo(() => ({
        cart,
        ...cartActions
    }), [cart, cartActions]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useShoppingCart() {
    return useContext(CartContext);
}