import React, { useState, useRef, useEffect } from "react";
import { useAuthenticatedApi } from "../hooks/useApi";
import { ChatInput, ChatMessages } from "../components/ChatComponents";
import Button from "../components/Button";
import { useShoppingCart } from "../context/CartContext";
import { useNotification } from "../context/NotificationContext";
import { getCartDifferences } from "../components/CartChangeSummary";

export default function ChatPage() {
    const CHAT_HISTORY_KEY = "chat";
    const storage = window.sessionStorage;
    const { callApi } = useAuthenticatedApi();
    const { cart, setCart, createCartFromSimplified } = useShoppingCart();
    const [messages, setMessages] = useState(() => {
        const stored = storage.getItem(CHAT_HISTORY_KEY);
        return stored
            ? JSON.parse(stored)
            : [];
    });
    const { showCartChanges } = useNotification();

    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        storage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending]);

    async function handleCartSuggestion(oldCart, newCart, onConfirm) {
        const changes = getCartDifferences(oldCart, newCart);

        if (changes.added.length === 0 && changes.removed.length === 0 && changes.changed.length === 0) {
            onConfirm();
        } else {
            const confirmed = await showCartChanges({
                oldCart: oldCart,
                newCart: newCart
            });
            if (confirmed) {
                onConfirm();
                setCart(newCart);
            } else {
                addAssistantMsg("Cancelled suggested changes.")
            }
        }
    }

    function addAssistantMsg(msg) {
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: msg },
        ]);
    }

    function addUserMsg(msg) {
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
    }

    async function sendMsg(msg) {
        if (!msg.trim()) return;
        addUserMsg(msg);
        setInputValue("");
        setSending(true);

        try {
            const data = await callApi("/assistant/ask/", "POST", {
                message: msg,
                cart: { "items": cart.map(item => ({ id: item.id, qty: item.quantity })) }
            });
            const answer = data.answer;

            const newCartItems = data.cart.items
            const newCart = createCartFromSimplified(newCartItems);
            handleCartSuggestion(cart, newCart, () => {
                addAssistantMsg(answer);
            });
        } catch (error) {
            // handle 403 auth error, or disable page routing if not logged in
            addAssistantMsg("Sorry, something went wrong. Please try again.");
        } finally {
            setSending(false);
        }
    }

    function handleClear() {
        setMessages([]);
        storage.removeItem(CHAT_HISTORY_KEY);
        // TODO: SEND DELETE request to backend to delete user chat history
    }

    return (
        <div className="flex flex-col h-[86.5dvh] max-w-full mx-auto border border-border rounded-lg overflow-hidden shadow-lg bg-bg-primary justify-center items-center">
            {messages.length > 0 ? (
                <ChatMessages messages={messages} sending={sending} />
            ) : (
                <div className="flex flex-col items-center justify-center h-1/8 px-6 text-center text-text-muted">
                    <h2 className="mb-4 text-2xl font-semibold">Welcome to the chat!</h2>
                    <p className="max-w-md">
                        Ask me anything or start a conversation here.
                    </p>
                </div>
            )}
            <ChatInput
                placeholder="Ask for recommended products and talk to StoreGPT here..."
                onSend={sendMsg}
                inputValue={inputValue}
                setInputValue={setInputValue}
                sending={sending}
            />
            {messages.length > 0 ? null :
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button variant="secondary" onClick={() => { sendMsg("What can you do?") }}>
                        What can you do?
                    </Button>
                    <Button variant="secondary" onClick={() => { sendMsg("Please recommend me an item.") }}>
                        Recommend me an item
                    </Button>
                    <Button variant="secondary" onClick={() => { sendMsg("Please choose an item for me and it to my cart") }}>
                        Add items to my cart
                    </Button>
                </div>}
        </div>
    );
}