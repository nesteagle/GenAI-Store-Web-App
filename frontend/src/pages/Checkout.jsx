import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthenticatedApi } from "../hooks/useApi";
import { useShoppingCart } from "../context/CartContext";
import CartItemList from "../components/CartItemList";
import { useNotification } from "../context/NotificationContext";
import { CartActionsCheckout } from "../components/CartActions";
import Main from "../components/Main";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Card from "../components/Card";

export default function CheckoutPage() {
    const { cart, changeCartItem, removeFromCart, clearCart } = useShoppingCart();
    const { showConfirm } = useNotification();

    async function handleClearCart() {
        const confirmed = await showConfirm({
            title: "Clear Cart",
            message: "Are you sure you want to remove all items from your cart? This action cannot be undone.",
            confirmLabel: "Clear Cart",
        });
        if (confirmed) {
            clearCart();
        }
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <Main className="py-12">
            <section className="max-w-6xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                <Card className="md:col-span-2 rounded-3xl shadow-2xl p-8 flex flex-col">
                    <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary mb-4">
                        Order Summary
                    </h1>
                    <p className="text-text-muted text-lg mb-8">
                        Review your order and adjust quantities before checkout.
                    </p>
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center py-20">
                            <Icon name="cart" size={64} className="text-text-muted mb-4" />
                            <div className="text-text-muted text-lg">Your cart is empty.</div>
                        </div>
                    ) : (
                        <>
                            <CartItemList
                                cart={cart}
                                changeCartItem={changeCartItem}
                                removeFromCart={removeFromCart}
                                variant="checkout"
                            />
                            <div className="flex justify-between items-center mt-8 mb-4">
                                <span className="text-base font-semibold text-text-primary">
                                    Total:
                                </span>
                                <span className="text-lg font-bold text-text-primary">
                                    ${cartTotal.toFixed(2)}
                                </span>
                            </div>
                            <CartActionsCheckout
                                onClearCart={handleClearCart}
                            />
                        </>
                    )}
                </Card>

                <Card className="rounded-3xl shadow-2xl p-8 flex flex-col gap-8 sticky top-24 self-start">
                    <h2 className="text-2xl font-bold text-text-primary">Checkout</h2>
                    <div>
                        <span className="block text-base font-semibold text-text-primary mb-2">Order Total</span>
                        <span className="text-2xl font-bold text-text-primary">
                            ${cartTotal.toFixed(2)}
                        </span>
                    </div>
                    <CheckoutButton />
                    <div className="flex items-center gap-3 mt-4">
                        <span className="text-text-muted text-sm">Secured by Stripe.</span>
                    </div>
                    <div className="text-xs text-text-muted mt-2">
                        Tip: For this demo, use card number 42424242... and any CVV/future expiry date.
                    </div>
                </Card>
            </section>
        </Main>
    );
}

export function CheckoutButton() {
    const { isAuthenticated } = useAuth0();
    const { callApi } = useAuthenticatedApi();
    const { cart } = useShoppingCart();
    const [processing, setProcessing] = useState(false);
    const isCheckoutDisabled = cart.length === 0 || !isAuthenticated;

    const handleCheckout = async () => {
        if (!isAuthenticated) return;
        setProcessing(true);
        const response = await callApi("/create-checkout-session/", "POST",
            JSON.stringify(cart.map(item => ({ id: item.id, qty: item.quantity })))
        );
        setProcessing(false);
        window.location.href = response.url;
    };

    return (
        <>
            {isCheckoutDisabled ? (
                <div className="text-lg text-text-muted mt-2 text-center">
                    {cart.length === 0 ? "Your cart is empty."
                        : !isAuthenticated ? "Please log in to checkout" : null}
                </div>
            ) : (
                <Button
                    variant="primary"
                    size="xl"
                    onClick={handleCheckout}
                    disabled={processing}
                    className="w-full rounded-full shadow-xl"
                >
                    <Icon name="lock" className="text-text-white mr-4" />
                    {processing ? "Processing..." : "Secure Checkout"}
                </Button>
            )}
        </>

    );
}