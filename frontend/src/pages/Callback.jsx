import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import { useAuthenticatedApi } from "../hooks/useApi";
import { useNotification } from "../context/NotificationContext";
import { useShoppingCart } from "../context/CartContext";


export default function Callback() {
    const { isLoading, isAuthenticated, error } = useAuth0();
    const { callApi } = useAuthenticatedApi();
    const { showToast } = useNotification();
    const { clearCart } = useShoppingCart();
    useEffect(() => {
        const fetchBackendUser = async () => {
            try {
                const data = await callApi("/myaccount");
            } catch (err) {
                return handleError(`Error: ${err.message}`);
            }
        };

        if (isAuthenticated && !isLoading) {
            fetchBackendUser();
        }
    }, [isAuthenticated, isLoading]);
    
    clearCart();

    if (isLoading) return <div>Loading authentication...</div>;
    if (!isAuthenticated) return handleError("Not authenticated");
    if (error) return handleError(`Auth error: ${error.message}`);

    function handleError(message) {
        showToast(message, "error");
        return <div>{message}</div>
    }

    return (
        <Navigate to="/" replace />
    );
}