import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthenticatedApi } from "../hooks/useApi";
import { useShoppingCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import { getCartDifferences } from "../components/CartChangeSummary";
import { useAuth0 } from "@auth0/auth0-react"

export function useChat(options = {}) {
    const {
        chatKey = "chat"
    } = options;

    const { isAuthenticated } = useAuth0();

    const storage = window.sessionStorage;
    const { callApi } = useAuthenticatedApi();
    const { cart, setCart, createCartFromSimplified } = useShoppingCart();
    const { showCartChanges } = useNotification();

    const [messages, setMessages] = useState(() => {
        const stored = storage.getItem(chatKey);
        return stored ? JSON.parse(stored) : [];
    });

    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        storage.setItem(chatKey, JSON.stringify(messages));
    }, [messages, chatKey]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, sending]);

    const addAssistantMsg = useCallback((msg) => {
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    }, []);

    const addUserMsg = useCallback((msg) => {
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
    }, []);

    const handleCartSuggestion = useCallback(async (oldCart, newCart, onConfirm) => {
        const changes = getCartDifferences(oldCart, newCart);
        if (changes.added.length === 0 && changes.removed.length === 0 && changes.changed.length === 0) {
            onConfirm();
        } else {
            const confirmed = await showCartChanges({ oldCart, newCart });
            if (confirmed) {
                onConfirm();
                setCart(newCart);
            } else {
                addAssistantMsg("Cancelled suggested changes.");
            }
        }
    }, [showCartChanges, setCart, addAssistantMsg]);

    const sendMsg = useCallback(async (msg) => {
        if (!msg.trim()) return;
        if (!isAuthenticated) {
            addAssistantMsg("You have to be signed in to chat with StoreGPT.");
            return;
        }
        addUserMsg(msg);
        setInputValue("");
        setSending(true);

        try {
            const data = await callApi("/assistant/ask/", "POST", {
                message: msg,
                cart: { items: cart.map(item => ({ id: item.id, qty: item.quantity })) }
            });
            const answer = data.answer;
            const newCartItems = data.cart.items;
            const newCart = createCartFromSimplified(newCartItems);
            handleCartSuggestion(cart, newCart, () => addAssistantMsg(answer));
        } catch (error) {
            addAssistantMsg("Sorry, something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    }, [callApi, cart, createCartFromSimplified, handleCartSuggestion, addAssistantMsg]);

    const handleClear = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            await callApi("/assistant/ask/", "DELETE");
            setMessages([]);
            storage.removeItem(chatKey);
            location.reload();
        } catch (error) {
            addAssistantMsg("Sorry, something went wrong when creating a new chat. Please try again.");
        }
    }, [chatKey, callApi, addAssistantMsg]);


    return {
        messages,
        inputValue,
        setInputValue,
        sending,
        sendMsg,
        addUserMsg,
        addAssistantMsg,
        handleClear,
        chatContainerRef
    };
}
