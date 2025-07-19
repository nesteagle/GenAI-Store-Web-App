import FormField from "../../components/FormField";
import { useAuthenticatedApi } from "../../hooks/useApi";
import { useMemo } from "react";
import useCreationForm from "../../hooks/useCreationForm";
import Button from "../../components/Button";
import Card from "../../components/Card";

export default function ItemCreationForm() {
    const { callApi } = useAuthenticatedApi();

    async function createItemUsingApi(data) {
        await callApi('/items/', 'POST', data);
    }

    const initialState = useMemo(
        () => ({ name: "", price: "", description: "", image_src: "" }),
        []
    );
    const { formData, handleChange, handleSubmit } = useCreationForm(
        initialState,
        createItemUsingApi
    );

    return (
        <Card className="p-6 shadow-md">
            <form className="text-text-primary"
                onSubmit={handleSubmit}
            >
                <h3 className="text-2xl font-semibold mb-4">Create New Item - Admin Only</h3>
                <FormField
                    label="Name:"
                    id="name"
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    width="w-full"
                />
                <FormField
                    label="Price:"
                    id="price"
                    type="number"
                    name="price"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    width="w-full"

                />
                <FormField
                    label="Description:"
                    id="description"
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    width="w-full"

                />
                <FormField
                    label="Image Link (must start with https:// or http://):"
                    id="image_src"
                    type="text"
                    name="image_src"
                    required
                    value={formData.image_src}
                    onChange={handleChange}
                    width="w-full"

                />
                <Button variant="primary" type="submit" className="w-full">
                    Create Item
                </Button>
            </form>
        </Card>
    );
}