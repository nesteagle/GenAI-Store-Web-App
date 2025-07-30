import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "./useApi";

const defaultFetchFunction = {
    endpoint: "/items/",
    method: "GET"
};

export default function useFetchList(dataKey, cacheKey,fetchFunction = defaultFetchFunction, cacheDuration = 15 * 60_1000) {
    const { callApi } = useAuthenticatedApi();
    const [data, setData] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchData() {
            setIsDataLoading(true);
            setError(null);

            const now = Date.now();
            if (cacheKey) {
                const cached = localStorage.getItem(cacheKey);
                const cacheTime = localStorage.getItem(`${cacheKey}_time`);
                if (cached && cacheTime && now - Number(cacheTime) < cacheDuration) {
                    if (!cancelled) {
                        setData(JSON.parse(cached));
                        setIsDataLoading(false);
                    }
                    return;
                }
            }

            try {
                const response = await callApi(fetchFunction.endpoint, fetchFunction.method);
                const result = dataKey ? response[dataKey] : response;
                if (!cancelled) {
                    setData(result);
                    if (cacheKey) {
                        localStorage.setItem(cacheKey, JSON.stringify(result));
                        localStorage.setItem(`${cacheKey}_time`, now.toString());
                    }
                }
            } catch (err) {
                if (!cancelled) setError(err);
            } finally {
                if (!cancelled) setIsDataLoading(false);
            }
        }

        fetchData();
        return () => {
            cancelled = true;
        };
    }, [callApi, fetchFunction.endpoint, fetchFunction.method, dataKey, cacheKey, cacheDuration]);

    return { data, isDataLoading, error };
}