import { useState } from "react";
import FormField from "../../components/FormField"; // Adjust the import path as needed
import Button from "../../components/Button";
import Card from "../../components/Card";

export default function EditItemUI({ item, onClose, onSave }) {
    const [form, setForm] = useState({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        image_src: item.image_src || "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...item, ...form });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <Card className="p-6 w-full max-w-md relative">
                <Button variant="secondary" onClick={onClose} className="absolute top-2 right-2">
                    ×
                </Button>
                <h2 className="text-xl font-bold mb-4">Edit Item</h2>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <FormField
                        label="Name"
                        id="edit-name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        width="w-full"
                    />
                    <FormField
                        label="Description"
                        id="edit-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        width="w-full"
                    />
                    <FormField
                        label="Price"
                        id="edit-price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        required
                        width="w-full"
                        min="0"
                        step="any"
                    />
                    <FormField
                        label="Image SRC"
                        id="edit-image-src"
                        name="image_src"
                        value={form.image_src}
                        onChange={handleChange}
                        width="w-full"
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
