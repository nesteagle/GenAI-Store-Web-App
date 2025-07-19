import { useMemo } from "react";
import AdminViewTable from "../components/AdminViewTable";
import { AdminLinkNavigation } from "../components/AdminLinkNavigation";
import Main from "../../components/Main";

export default function Users() {
    const columns = useMemo(() => [
        { key: 'id', label: 'ID' },
        { key: 'email', label: 'Email' },
        { key: 'auth0_sub', label: 'Auth0 ID' }
    ], []);
    return (
        <Main>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-6 tracking-tight">Users</h1>
            <AdminViewTable endpoint="/admin/users/" columns={columns} dataKey="users" />
            <AdminLinkNavigation/>
        </Main>
    );
}
