import { useState, useRef, useEffect, useCallback } from "react";
import { useShoppingCart } from "../context/CartContext";
import ShoppingCart from "./ShoppingCart";
import Icon from "./Icon";

export default function ShoppingCartButton() {
    const { cart } = useShoppingCart();
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    const handleClick = useCallback(
        (e) => {
            if (buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        },
        [setOpen]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [open, handleClick]);

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="relative" ref={buttonRef}>
            <button
                className="cursor-pointer relative flex items-center justify-center w-10 h-10 rounded-full bg-bg-tertiary hover:bg-button/10 transition hover:scale-icon-medium duration-200 focus:outline-none focus:ring-2 focus:ring-ring-accent/50"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open shopping cart"
            >
                <Icon name="cart" className="text-text-accent" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        {itemCount}
                    </span>
                )}
            </button>
            {open && <ShoppingCart onClose={() => setOpen(false)} />}
        </div>
    );
}