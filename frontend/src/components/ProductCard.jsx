import { useState } from "react";
import { Link } from 'react-router-dom';
import { useShoppingCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import Button from "./Button";

export default function ProductCard({ product, showAddToCart }) {
    const [imgError, setImgError] = useState(false);
    const validImageSrc = product.image_src && /^https?:\/\//.test(product.image_src);
    const { addCartItem } = useShoppingCart();
    const { showToast } = useNotification();
    
    return (
        <div className="group bg-bg-secondary rounded-2xl shadow-lg flex flex-col p-5 border border-border-muted transition-all duration-200 hover:shadow-2xl hover:border-accent/70 relative overflow-hidden">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-accent/5 to-accent/8 rounded-2xl pointer-events-none" />

            {validImageSrc && !imgError ? (
                <img
                    src={product.image_src}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    className="w-full aspect-square object-cover rounded-xl mb-4 bg-bg-tertiary shadow-sm group-hover:scale-icon transition-transform"
                />
            ) : (
                <div className="w-full aspect-square flex items-center justify-center rounded-xl mb-4 bg-bg-tertiary text-text-muted text-sm">
                    No Image
                </div>
            )}

            <div className="flex-1 flex flex-col justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-text-primary mb-1 truncate">{product.name}</h3>
                <p className="text-text-accent font-extrabold text-xl">${product.price.toFixed(2)}</p>
            </div>

            <div className="flex flex-col gap-2">
                {showAddToCart && (
                    <Button variant="primary" onClick={() => { addCartItem(product, 1); showToast("Item added to cart!", "success"); }}>
                        Add to Cart
                    </Button>
                )}
                <Link
                    to={`/products/${product.id}`}
                    className="gray-btn-transition py-2"
                >
                    View Product
                </Link>
            </div>
        </div>
    );
}