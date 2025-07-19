export default function Main({ className="", children }) {
    return (
        <main className={`${className} min-h-screen bg-bg-primary flex flex-col w-full transition-colors duration-200`}>
                {children}
        </main>
    );
}