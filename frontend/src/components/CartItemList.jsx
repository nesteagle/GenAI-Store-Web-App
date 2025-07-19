import Button from "./Button";
import FormField from "./FormField";

export default function CartItemList({
    cart,
    changeCartItem,
    removeFromCart,
    variant = "popup", // "popup" or "checkout"
}) {
    return (
        <ul className={`divide-y divide-border-muted mb-4 ${variant === "checkout" ? "max-h-full" : "max-h-64 overflow-y-auto"}`}>
            {cart.map((item) => (
                <li key={item.id} className={`flex items-center justify-between py-3 ${variant === "checkout" ? "py-6" : ""}`}>
                    <div className="flex items-center gap-3">
                        <img
                            src={item.image_src}
                            alt={item.name}
                            className={`object-cover rounded border border-border-muted bg-bg-tertiary ${variant === "checkout" ? "w-20 h-20" : "w-12 h-12"}`}
                        />
                        <div>
                            <span className="block font-medium text-text-primary">{item.name}</span>
                            <span className="block text-xs text-text-muted">${item.price.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <FormField
                            label="Qty"
                            id={`quantity-${item.id}`}
                            type="number"
                            name="quantity"
                            min={1}
                            value={String(item.quantity)}
                            onChange={(e) => {
                                const newQuantity = parseInt(e.target.value, 10);
                                if (newQuantity >= 1) {
                                    changeCartItem(item, newQuantity);
                                }
                            }}
                        />
                        <Button variant="warning" size="xs" onClick={() => removeFromCart(item.id)} className="w-full text-left mt-1.5">
                            Remove
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}