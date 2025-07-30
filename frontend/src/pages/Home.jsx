import { useMemo } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import useFetchList from "../hooks/useFetchList";
import useProductFilters from "../hooks/useProducts";
import Main from "../components/Main";
import Container from "../components/Container";

export default function HomePage() {
    const { data } = useFetchList("items", "items_cache");
    const { products } = useProductFilters(data, "Featured");

    return (
        <Main>
            <section className="w-full bg-gradient-to-r from-accent/10 via-bg to-accent/10 py-20">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-4 text-text-primary">
                            Discover Quality. Shop with Confidence.
                        </h1>
                        <p className="text-lg text-text-muted mb-8 max-w-xl">
                            Carefully selected products, effortless browsing, and secure checkout, all made simple.
                        </p>
                        <Link to="/catalog" className="btn-primary btn-transition">
                            Shop Bestsellers
                        </Link>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <img
                            src="https://images.pexels.com/photos/1405762/pexels-photo-1405762.jpeg"
                            alt="Featured products"
                            className="rounded-3xl shadow-lg w-full max-w-md object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>

            <Container className="py-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-text-primary">
                    Featured Products
                </h2>
                <ProductGrid products={products} showAddToCart={false} />
                <div className="flex justify-center mt-8">
                    <Link to="/catalog" className="link-primary">
                        View All Products
                    </Link>
                </div>
            </Container>

            <section className="w-full bg-bg-tertiary py-16">
                <Container size="sm" className="text-center">
                    <h3 className="text-2xl font-bold mb-4 text-text-primary">About</h3>
                    <p className="text-lg text-text-muted mb-6">
                        Hi, I'm Aaron! This platform is a summer project I independently designed and built between first and second year, during my undergraduate degree in Computer Science + Statistics at UBC.
                    </p>
                    <Link to="https://github.com/nesteagle" className="link-primary">
                        Discover My Work
                    </Link>
                </Container>
            </section>
        </Main>
    );
}