import React, { useState, useRef, useEffect } from "react";
import { useAuthenticatedApi } from "../hooks/useApi";

export default function ChatPage() {
    const CHAT_HISTORY_KEY = "chat";
    const storage = window.sessionStorage;
    const { callApi } = useAuthenticatedApi();
    const [messages, setMessages] = useState(() => {
        // On mount, try to load from sessionStorage (or empty with welcome)
        const stored = storage.getItem(CHAT_HISTORY_KEY);
        return stored
            ? JSON.parse(stored)
            : [
                {
                    role: "assistant",
                    content: "Hello! How can I help you today?",
                },
            ];
    });

    const [inputValue, setInputValue] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef(null);

    // Save chat history in sessionStorage on every change
    useEffect(() => {
        storage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }, [messages]);

    // Autoscroll to the bottom on new message
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
            // callApi(endpoint, "POST", message) - assumes it returns { answer: ... }
            const data = await callApi("/assistant/ask/", "POST", {message: msg});
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
            // Optionally log error
            // console.error(error);
        } finally {
            setSending(false);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMsg(inputValue);
        }
    }

    function handleClear() {
        setMessages([
            {
                role: "assistant",
                content: "Hello! How can I help you today?",
            },
        ]);
        storage.removeItem(CHAT_HISTORY_KEY);
    }

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white">
            <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <span className="font-semibold text-lg">AI Shop Assistant</span>
                <button
                    onClick={handleClear}
                    className="rounded-md bg-gray-700 px-3 py-1 text-xs hover:bg-gray-900"
                >
                    Clear Chat
                </button>
            </header>

            <main
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3"
                aria-live="polite"
                aria-relevant="additions"
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-wrap text-sm ${m.role === "user"
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-gray-300"
                                }`}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex justify-start">
                        <div className="max-w-[70%] px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm italic text-gray-500">
                            Assistant is typing...
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-4 bg-white border-t border-gray-300">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMsg(inputValue);
                    }}
                    className="flex items-center space-x-3"
                >
                    <textarea
                        rows={1}
                        className="flex-grow resize-none border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        aria-label="Chat message input"
                    />
                    <button
                        type="submit"
                        disabled={sending || !inputValue.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm"
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </form>
            </footer>
        </div>
    );
}