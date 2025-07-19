import { Link } from "react-router-dom";
import Button from "./Button";
import Icon from "./Icon";

export function CartActionsPopup({
    onClearCart,
    onClose,
}) {
    return (
        <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-2">
                <Button variant="danger" onClick={onClearCart} className="w-1/2 z-50">
                    Clear Cart
                </Button>
                <Button variant="primary" onClick={onClose} className="w-1/2 z-50">
                    <Link to="/checkout">Checkout</Link>
                </Button>
            </div>
            <Link
                to="/catalog"
                className="link-primary z-50"
                onClick={onClose}
            >
                Add More Items
            </Link>

        </div>
    );
}

export function CartActionsCheckout({ onClearCart }) {
    return (
        <nav
            aria-label="Cart actions"
            className="w-full mt-8 flex flex-row items-center gap-6 justify-end"
        >
            <Link
                to="/catalog"
                className="inline-flex items-center gap-2 z-50 px-6 py-3 rounded-full bg-button text-text-white font-semibold shadow-sm hover:bg-button-active hover:text-text-white transition text-base group"
                tabIndex={0}
            >
                <Icon name="plus" size={28} className="text-text-white group-hover:text-text-white group-focus:text-text-white transition" />
                Add More Items
            </Link>

            <Button
                variant="warning"
                size="lg"
                onClick={onClearCart}
                className="inline-flex items-center z-50 gap-2 rounded-full"
            >
                <Icon name="close" size={28} className="text-red-500" />
                Clear Cart
            </Button>
        </nav>
    );
}