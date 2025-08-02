import { ChatInput, ChatMessages } from "../components/ChatComponents";
import Button from "../components/Button";
import { useChat } from "../hooks/useChat";

export default function ChatPage() {
    const {
        messages, inputValue, setInputValue, sending, sendMsg, handleClear,
    } = useChat();
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