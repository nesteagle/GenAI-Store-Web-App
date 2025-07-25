import React, { useState, useRef, useEffect } from "react";
import { useAuthenticatedApi } from "../hooks/useApi";
import { ChatInput, ChatMessages } from "../components/ChatComponents";
import Button from "../components/Button";

export default function ChatPage() {
    const CHAT_HISTORY_KEY = "chat";
    const storage = window.sessionStorage;
    const { callApi } = useAuthenticatedApi();
    const [messages, setMessages] = useState(() => {
        const stored = storage.getItem(CHAT_HISTORY_KEY);
        return stored
            ? JSON.parse(stored)
            : [];
    });

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

    async function sendMsg(msg) {
        if (!msg.trim()) return;
        setMessages((prev) => [...prev, { role: "user", content: msg }]);
        setInputValue("");
        setSending(true);

        try {
            const data = await callApi("/assistant/ask/", "POST", { message: msg });
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data },
            ]);
        } catch (error) {
            // handle 403 auth error, or disable page routing if not logged in
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, something went wrong. Please try again.",
                },
            ]);
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