import { useMemo } from "react";
import AdminViewTable from "../components/AdminViewTable";
import { AdminLinkNavigation } from "../components/AdminLinkNavigation";
import Main from "../../components/Main";

export default function Orders() {
    const columns = useMemo(() => [
        { key: 'id', label: 'UUID' },
        { key: 'user_id', label: 'User ID' },
        { key: 'date', label: 'Date' },
        {
            key: "items",
            label: "Items",
            render: (items) =>
                items.map(i => `\"${i.name}\" x${i.quantity}`).join(", ")
        }
    ], []);

    return (
        <Main>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-6 tracking-tight">Orders</h1>
            <AdminViewTable endpoint="/admin/orders/" columns={columns} dataKey="orders" />
            <AdminLinkNavigation/>
        </Main>
    );
}