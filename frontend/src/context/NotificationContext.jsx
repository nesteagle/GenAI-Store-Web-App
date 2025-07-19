import { createContext, useContext, useState, useCallback } from "react";
import ConfirmNotification from "../components/ConfirmNotification";
import ToastNotification from "../components/ToastNotification";
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts(ts => [...ts, { id, message, type }]);
        setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 2500);
    }, []);

    const showConfirm = useCallback(({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel" }) => {
        return new Promise((resolve) => {
            setConfirmState({
                open: true,
                title,
                message,
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

    return (
        <NotificationContext.Provider value={{ showToast, showConfirm }}>
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
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}