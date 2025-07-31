import { createContext, useContext, useState, useCallback } from "react";
import ConfirmNotification from "../components/ConfirmNotification";
import ToastNotification from "../components/ToastNotification";
import { CartChangesNotification } from "../components/CartChangeSummary";
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const [cartConfirmState, setCartConfirmState] = useState(null);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(ts => [...ts, { id, message, type }]);
        setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2500);
    }, []);

    const showConfirm = useCallback(({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", children=null }) => {
        return new Promise((resolve) => {
            setConfirmState({
                open: true,
                title,
                message,
                children,
                confirmLabel,
                cancelLabel,
                onConfirm: () => {
                    setConfirmState(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmState(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const showCartChanges = useCallback(({ oldCart, newCart }) => {
        return new Promise((resolve) => {
            setCartConfirmState({
                open: true,
                oldCart,
                newCart,
                onConfirm: () => {
                    setCartConfirmState(null);
                    resolve(true);
                },
                onCancel: () => {
                    setCartConfirmState(null);
                    resolve(false);
                }
            })
        })
    })

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm, showCartChanges }}>
            {children}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
                {toasts.map(t => (
                    <ToastNotification
                        key={t.id}
                        message={t.message}
                        type={t.type}
                        onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))}
                    />
                ))}
            </div>
            <ConfirmNotification {...confirmState} />
            <CartChangesNotification {...cartConfirmState} />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}