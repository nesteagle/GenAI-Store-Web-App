import { useMemo } from "react";
import ObjectViewTable from "./ObjectViewTable";
import useFetchList from "../../hooks/useFetchList";
import LoadingIcon from "../../components/LoadingIcon";

export default function AdminViewTable({ endpoint, columns, dataKey }) {
    const fetchFunction = useMemo(() => ({ endpoint, method: "GET" }), [endpoint]);
    const { data, isDataLoading, error } = useFetchList(fetchFunction, dataKey);

    if (isDataLoading) return <LoadingIcon />;
    if (error) return <div className="text-text-primary">Error: {error.message || "Unknown error"}</div>;
    return <ObjectViewTable data={data} columns={columns} />;
}