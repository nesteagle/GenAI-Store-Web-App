import ProductGrid from "../components/ProductGrid";
import useProductFilters from "../hooks/useProducts"
import useFetchList from "../hooks/useFetchList";
import LoadingIcon from "../components/LoadingIcon";
import Main from "../components/Main";
import Card from "../components/Card";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Container from "../components/Container";

export default function Catalog() {
    const { data, isDataLoading, error } = useFetchList("items", "items_cache");
    const { category, setCategory, categories, search, setSearch, products } = useProductFilters(data, "All");

    return (
        <Main>
            <section className="pt-12 pb-12 bg-gradient-to-r from-accent/5 via-bg to-accent/5">
                <Container className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary mb-2">
                            {`${category} Products`}
                        </h1>
                        <p className="text-text-muted text-lg max-w-2xl">
                            Discover our curated selection of quality items. Browse, filter, and find your next favorite product.
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? "primary" : "catalog_disabled"}
                                onClick={() => setCategory(cat)}
                                className="rounded-full"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </Container>
            </section>

            <Card className="py-6 mb-6">
                <Container className="flex justify-center">
                    <div className="relative w-full max-w-xl">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-accent">
                            <Icon name="search" size={24} />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`Search ${category.toLowerCase()} products...`}
                            className="w-full pl-12 pr-14 py-4 rounded-full border-2 border-accent/30 bg-bg-tertiary text-lg focus:outline-none focus:ring-2 focus:ring-ring-accent/40 transition text-text-primary"
                        />
                        {search && (
                            <Button
                                variant="secondary"
                                size="xs"
                                onClick={() => setSearch("")}
                                className="absolute top-3 right-4 rounded-full"
                            >
                                <Icon name="close" />
                            </Button>
                        )}
                    </div>
                </Container>
            </Card>

            <Container>
                {isDataLoading ? (
                    <div className="flex flex-col items-center py-24">
                        <LoadingIcon />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-24">
                        <Icon name="error" size={48} className="text-error mb-4" />
                        <p className="text-error text-lg">Failed to load products. Please try again later.</p>
                    </div>
                ) : products.length ? (
                    <ProductGrid products={products} />
                ) : (
                    <div className="flex flex-col items-center py-24">
                        <Icon name="cart" size={48} className="text-text-muted mb-4" />
                        <p className="text-text-muted text-lg">No products found in this category.</p>
                    </div>
                )}
            </Container>
        </Main>
    );
}