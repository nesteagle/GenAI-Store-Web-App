import { useMemo } from "react";
import ItemCreationForm from "../components/ItemCreationForm";
import useFetchList from "../../hooks/useFetchList";
import ObjectViewTable from "../components/ObjectViewTable";
import LoadingIcon from "../../components/LoadingIcon";
import { AdminLinkNavigation } from "../components/AdminLinkNavigation";
import AdminItemsList from "../components/AdminItemsList";
import Main from "../../components/Main";

export default function Items() {
    const columns = useMemo(
        () => [
            { key: "id", label: "ID" },
            { key: "name", label: "Name" },
            { key: "description", label: "Description" },
            { key: "price", label: "Price" },
            { key: "image_src", label: "Image SRC" },
        ],
        []
    );

    const fetchFunction = useMemo(() => ({
        endpoint: "/items/",
        method: "GET"
    }), []);
    const { data, isDataLoading } = useFetchList(fetchFunction, "items", "items_cache", 10 * 1000);
    if (isDataLoading) return <LoadingIcon />
    return (
        <Main>
            <AdminItemsList />
            <ItemCreationForm />
            <AdminLinkNavigation />
        </Main>
    );
}