import { useMemo } from 'react';

export function useCartCalculations(cart = []) {
    return useMemo(() => {
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const isEmpty = cart.length === 0;
        const hasItems = cart.length > 0;
        
        return {
            itemCount,
            total: Number(total.toFixed(2)),
            totalFormatted: `$${total.toFixed(2)}`,
            isEmpty,
            hasItems,
            cartSize: cart.length
        };
    }, [cart]);
}