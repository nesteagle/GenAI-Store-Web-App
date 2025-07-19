import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { apiRequest } from "../api/baseApi";


export function useAuthenticatedApi() {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    const callApi = useCallback(
        async (endpoint, method = "GET", data = null) => {
            let token = null;
            if (isAuthenticated) {
                token = await getAccessTokenSilently();
            }
            return apiRequest(endpoint, method, data, token);
        },
        [isAuthenticated, getAccessTokenSilently]
    );

    return { callApi };
}