import ItemCreationForm from "../components/ItemCreationForm";
import { AdminLinkNavigation } from "../components/AdminLinkNavigation";
import AdminItemsList from "../components/AdminItemsList";
import Main from "../../components/Main";

export default function Items() {
    return (
        <Main>
            <AdminItemsList />
            <ItemCreationForm />
            <AdminLinkNavigation />
        </Main>
    );
}