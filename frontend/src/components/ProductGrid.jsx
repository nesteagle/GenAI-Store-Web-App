import ProductCard from "./ProductCard";

export default function ProductGrid({ products, showAddToCart = true }) {
    return (
        <div
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6 bg-bg-primary rounded-xl shadow"
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} showAddToCart={showAddToCart} />
            ))}
        </div>
    );
}