import { useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import useFetchList from "../hooks/useFetchList";
import Main from "../components/Main";
import Card from "../components/Card";
import Button from "../components/Button";
import Icon from "../components/Icon";

export default function AccountPage() {
    const fetchFunction = useMemo(() => ({
        endpoint: "/orders/",
        method: "GET"
    }), []);
    const { data, isDataLoading, error } = useFetchList("orders", "orders_cache", fetchFunction, 3 * 60 * 1000);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const { isAuthenticated } = useAuth0();

    const orders = [...(data || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    const formatDate = (dateString) => new Date(dateString.concat("Z")).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });

    const truncate = (str, max = 64) => str?.length > max ? str.slice(0, max - 1) + '…' : str || '';

    const calcTotal = (items) => items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0).toFixed(2);

    if (!orders?.length) {
        return (
            <Main className="py-16">
            <Card className="max-w-2xl mx-auto px-4 py-20 text-center rounded-full">
                <h1 className="font-sans font-semibold text-3xl mb-2 text-text-primary">
                {isAuthenticated ? "No Orders Yet" : "Not Signed In"}
                </h1>
                <p className="text-text-muted text-lg">
                {isAuthenticated
                    ? "Your orders will appear here after your first purchase."
                    : "Sign in to view your orders."}
                </p>
            </Card>
            </Main>
        );
    }

    return (
        <Main>
            <div className="max-w-3xl mx-auto py-10 px-4">
                <h1 className="font-display text-3xl font-bold mb-8 text-text-primary text-center">Order History</h1>
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card
                            key={order.id}
                            className="group hover:scale-[1.01] transition-transform duration-200"
                            tabIndex={0}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                                <div className="flex-1">
                                    <div className="text-sm text-text-muted mb-2">{formatDate(order.date)}</div>
                                    <h2 className="font-display text-lg mb-3 text-text-primary">
                                        Order #{order.id.slice(-6).toUpperCase()}
                                    </h2>
                                    <ul className="space-y-2">
                                        {order.items.map(item => (
                                            <li key={item.id} className="flex items-center gap-3">
                                                <img
                                                    src={item.image_src}
                                                    alt={item.name}
                                                    className="w-10 h-10 rounded object-cover border border-border-muted"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-text-primary truncate">{item.name}</div>
                                                    <div className="text-xs text-text-muted truncate">{truncate(item.description)}</div>
                                                </div>
                                                <span className="text-sm text-text-muted">×{item.quantity}</span>
                                                <span className="font-medium text-button">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="text-right">
                                    <div className="text-button font-bold text-2xl mb-2">${calcTotal(order.items)}</div>
                                    <Button variant="primary" onClick={() => setSelectedOrder(order)}>
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                        <Card className="max-w-lg w-full p-6 relative">
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-4 right-4"
                                size="sm"
                            >
                                <Icon name="close" />
                            </Button>
                            <h2 className="font-display text-xl font-bold mb-1 text-text-primary text-center">Order Details</h2>
                            <div className="text-center text-text-muted mb-4">
                                #{selectedOrder.id.slice(-6).toUpperCase()} • {formatDate(selectedOrder.date)}
                            </div>
                            <ul className="divide-y divide-border-muted mb-4">
                                {selectedOrder.items.map(item => (
                                    <li key={item.id} className="flex items-center gap-3 py-3">
                                        <img
                                            src={item.image_src}
                                            alt={item.name}
                                            className="w-10 h-10 rounded object-cover border border-border-muted"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-text-primary">{item.name}</div>
                                            <div className="text-xs text-text-muted">{item.description}</div>
                                        </div>
                                        <span className="text-sm text-text-muted">×{item.quantity}</span>
                                        <span className="font-medium text-button">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-between items-center p-3 bg-bg-tertiary rounded mb-4">
                                <span className="font-medium text-text-primary">Total</span>
                                <span className="text-button font-bold text-xl">${calcTotal(selectedOrder.items)}</span>
                            </div>
                            <Button variant="primary" size="lg" onClick={() => setSelectedOrder(null)} className="w-full">
                                Done
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        </Main>
    );
}