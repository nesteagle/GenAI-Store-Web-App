import { apiRequest } from "./baseApi";

export async function getItem(id) {
    const int_id = parseInt(id);
    if (int_id == null || !Number.isInteger(int_id) || int_id <= 0) {
        throw new Error("Valid positive integer ID required");
    }
    const endpoint = `/items/${int_id}`
    const response = await apiRequest(endpoint, "GET");
    return response.item;
}