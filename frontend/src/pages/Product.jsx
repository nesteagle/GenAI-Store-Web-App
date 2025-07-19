import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useShoppingCart } from "../context/CartContext";
import { getItem } from "../api/itemsApi";
import { useNotification } from "../context/NotificationContext";
import Main from "../components/Main";
import Button from "../components/Button";
import FormField from "../components/FormField";
import LoadingIcon from "../components/LoadingIcon";

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [error, setError] = useState(null);
    const { addCartItem } = useShoppingCart();
    const [quantity, setQuantity] = useState(1);
    const { showToast } = useNotification();

    useEffect(() => {
        async function fetchItem() {
            try {
                setError(null);
                const data = await getItem(id);
                setProduct(data);
            } catch (err) {
                setError("Failed to fetch item. Please try again.");
                setProduct(null);
            }
        }
        fetchItem();
    }, [id]);


    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <span className="text-text-muted text-lg font-semibold mb-4">
                    An error ocurred when loading this product.
                </span>
                <Button variant="secondary" onClick={() => navigate(-1)}>
                    ← Back to Catalog
                </Button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <LoadingIcon message="Loading product..." />
            </div>
        );
    }


    const validImageSrc = product.image_src && /^https?:\/\//.test(product.image_src);

    return (
        <Main>
            <div className="relative min-h-screen bg-gradient-to-b from-bg via-surface/60 to-bg/80 py-24 px-4 flex flex-col items-center">
                <div className="w-full max-w-7xl rounded-[2.5rem] shadow-2xl bg-bg-secondary border border-border-muted px-8 md:px-12 py-20">
                    <nav className="text-sm text-text-muted flex items-center gap-2 mb-6">
                        <span className="link-underline-transition" onClick={() => navigate("/")}>
                            Home
                        </span>
                        <span>/</span>
                        <span className="link-underline-transition" onClick={() => navigate(-1)}>
                            Catalog
                        </span>
                        <span>/</span>
                        <span className="font-semibold">{product.name}</span>
                    </nav>

                    <Button variant="secondary" size="lg" onClick={() => navigate(-1)} className="mb-16">
                        ← Back to Catalog
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                        <div className="flex flex-col items-center justify-center relative">
                            <div className="absolute -inset-10 rounded-3xl bg-gradient-to-tr from-accent/10 via-transparent to-accent/5 blur-2xl" />
                            {validImageSrc && !imgError ? (
                                <img
                                    src={product.image_src}
                                    alt={product.name}
                                    onError={() => setImgError(true)}
                                    className="relative z-10 max-h-[38rem] w-auto rounded-3xl shadow-2xl object-contain bg-bg-tertiary border-8 border-white"
                                />
                            ) : (
                                <div className="relative z-10 flex items-center justify-center w-96 h-96 rounded-3xl bg-bg-tertiary text-text-muted text-2xl font-semibold shadow-2xl border-8 border-white">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <h1 className="text-5xl font-display font-extrabold text-text-primary mb-6 leading-tight">{product.name}</h1>
                            <p className="text-text-accent text-4xl font-bold mb-8">${product.price.toFixed(2)}</p>

                            <section className="bg-bg-tertiary rounded-xl p-8 mb-10 shadow-sm">
                                <h2 className="text-xl font-bold mb-2 text-text-primary">Description</h2>
                                <p className="text-text-primary text-lg">{product.description}</p>
                            </section>

                            <div className="flex items-center gap-4 mb-8">
                                <FormField
                                    label="Quantity:"
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                                    className="w-20 text-lg"
                                />
                            </div>

                            <Button
                                variant="primary"
                                size="xl"
                                onClick={() => {
                                    addCartItem(product, quantity);
                                    showToast(`Item${quantity > 1 ? 's' : ''} added to cart!`, "success");
                                }}
                                className="rounded-2xl shadow-xl text-2xl flex w-full items-center">
                                <span>Add to Cart</span>
                                <span className="ml-auto text-2xl font-bold">
                                    ${(product.price * quantity).toFixed(2)}
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Support */}
                <div className="fixed bottom-0 left-0 w-full bg-bg-secondary/90 backdrop-blur-lg shadow-t px-4 py-3 flex justify-between items-center md:hidden z-50">
                    <span className="text-xl font-bold text-text-primary">{product.name}</span>
                    <Button variant="primary" onClick={() => addCartItem(product, 1)} className="rounded-xl shadow text-lg">
                        Add to Cart
                    </Button>
                </div>
            </div>
        </Main>
    );
}