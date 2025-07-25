
import { useState, useRef, useCallback, useEffect } from 'react';
import Icon from './Icon';
import Button from './Button';

export function ChatInput({ onSend, placeholder }) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef(null);

    const LINE_HEIGHT_PX = 24; // inclusive of text padding etc
    const MAX_LINES = 12;
    const MAX_HEIGHT_PX = LINE_HEIGHT_PX * MAX_LINES + 16; // since py-2 is 8px on both sides

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;

        if (scrollHeight < MAX_HEIGHT_PX) {
            textarea.style.height = `${scrollHeight}px`;
            textarea.style.overflowY = 'hidden';
        } else {
            textarea.style.height = `${MAX_HEIGHT_PX}px`;
            textarea.style.overflowY = 'auto';
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [message, adjustHeight]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
                onSend?.(message.trim());
                setMessage('');
            }
        }
    };

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (message.trim()) {
                    onSend?.(message.trim());
                    setMessage('');
                }
            }}
            className="w-11/12 max-w-3xl bg-bg-secondary rounded-lg shadow p-4 border border-border focus-within:border-accent transition-colors mb-6"
            aria-label="Chat message input"
        >
            <textarea
                ref={textareaRef}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                spellCheck={false}
                className={`w-full resize-none rounded-md px-3 py-2 font-sans text-base text-text-primary placeholder:text-text-muted leading-6 max-h-[${MAX_HEIGHT_PX}px] overflow-y-auto focus:outline-none transition`}
                aria-label="Message input"
            />

            <div className="flex items-center justify-between mt-2">
                <div className="flex space-x-2">
                    <Button variant="secondary" size="xs" aria-label="Checkout">
                        <Icon name="cart" />
                    </Button>
                    <Button variant="secondary" size="xs" aria-label="New Chat">
                        <Icon name="plus" />
                    </Button>
                </div>

                <Button
                    variant="secondary"
                    size="xs"
                    disabled={!message.trim()}
                    aria-label="Send message"
                    className={`${!message.trim() && 'bg-bg-tertiary text-text-muted'}`}
                >
                    <Icon name="search" />
                </Button>
            </div>
        </form>
    );
}

export function ChatMessages({ messages = [], sending = false }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, sending]);

    if (!messages.length && !sending) {
        return (
            <div className="flex-1 p-4 flex items-center justify-center text-text-muted italic">
                No messages yet.
            </div>
        );
    }

    return (
        <main
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-primary"
            aria-live="polite"
            aria-relevant="additions"
            role="log"
        >
            {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                    <div
                        key={i}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                        <div className={` max-w-[70%] whitespace-pre-wrap rounded-lg px-4 py-2 text-sm break-words
                            ${isUser ?
                                "bg-button text-button-text rounded-tr-none shadow" :
                                "bg-bg-secondary border border-border rounded-tl-none"}`}
                        >
                            {msg.content}
                        </div>
                    </div>
                );
            })}

            {sending && (
                <div className="flex justify-start">
                    <div className=" max-w-[70%] px-4 py-2 rounded-lg bg-bg-secondary border border-border text-sm italic text-text-muted select-none">
                        StoreGPT is thinking...
                    </div>
                </div>
            )}
        </main>
    );
}
