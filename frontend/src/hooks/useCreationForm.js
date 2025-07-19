import { useState } from "react";

export default function useCreationForm(initialState, onSubmit) {
    const [formData, setFormData] = useState(initialState);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(formData);
        setFormData(initialState);
    };

    return { formData, handleChange, handleSubmit };
}