import { useState, useMemo } from "react";
import ConfirmNotification from "../../components/ConfirmNotification";
import EditItemUI from "./EditItemUI";
import LoadingIcon from "../../components/LoadingIcon";
import useFetchList from "../../hooks/useFetchList";
import { useAuthenticatedApi } from "../../hooks/useApi";
import Card from "../../components/Card";

export default function AdminItemsList() {
    const { data: items, isDataLoading } = useFetchList("items");
    const { callApi } = useAuthenticatedApi();

    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async (item) => {
        const response = await callApi(`/items/${item.id}`, "DELETE")
        setConfirmOpen(false);
        setDeletingItem(null);
    };

    const handleEditSave = async (updatedItem) => {
        const response = await callApi(`/items/${updatedItem.id}`, "PUT", {
            ...updatedItem
        })
        setEditingItem(null);
    };

    if (isDataLoading) return <LoadingIcon />;

    // Table header columns
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
        { key: "price", label: "Price" },
        { key: "image_src", label: "Image SRC" },
    ];

    const renderRow = (item) => (
        <tr key={item.id} className="border border-text-muted/50 bg-bg-primary hover:bg-bg-tertiary">
            {columns.map(col => (
                <td key={col.key} className="px-4 py-2 text-text-primary">{item[col.key]}</td>
            ))}
            <td className="px-4 py-2">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 btn-transition text-text-white text-display font-semibold"
                        onClick={() => setEditingItem(item)}
                    >
                        Modify
                    </button>
                    <button
                        className="px-3 py-1 clear-btn-transition"
                        onClick={() => {
                            setDeletingItem(item);
                            setConfirmOpen(true);
                        }}
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <section className="w-full min-h-[60vh] py-6 px-2 sm:px-6 bg-bg-primary">
            <Card>
                <h2 className="text-3xl font-bold mb-6 text-text-primary">All Items</h2>
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] border rounded-lg overflow-hidden mb-8">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className="px-4 py-2 bg-bg-secondary text-left text-text-primary">{col.label}</th>
                                ))}
                                <th className="px-4 py-2 bg-bg-secondary text-text-primary text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && items.map(renderRow)}
                        </tbody>
                    </table>
                </div>
                {editingItem && (
                    <EditItemUI
                        item={editingItem}
                        onClose={() => setEditingItem(null)}
                        onSave={handleEditSave}
                    />
                )}
                <ConfirmNotification
                    open={confirmOpen}
                    title="Confirm Delete"
                    message={deletingItem ? `Are you sure you want to delete "${deletingItem.name}"?` : ""}
                    confirmLabel="Delete"
                    onCancel={() => {
                        setConfirmOpen(false);
                        setDeletingItem(null);
                    }}
                    onConfirm={() => handleDelete(deletingItem)}
                />
            </Card>
        </section>
    );

}