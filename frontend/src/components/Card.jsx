export default function Card({ className = "", children }) {
    return (
        <div className={`w-full bg-bg-secondary rounded-xl border border-border-muted transition-colors duration-200 ${className}`}>
            {children}
        </div>
    );
}