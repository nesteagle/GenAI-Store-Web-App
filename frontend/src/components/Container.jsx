export default function Container({ size = "default", className = "", children }) {
    const sizes = {
        sm: "max-w-2xl",
        md: "max-w-4xl",
        default: "max-w-7xl",
        lg: "max-w-full"
    };

    return (
        <div className={`${sizes[size]} mx-auto px-4 sm:px-6 ${className}`}>
            {children}
        </div>
    );
}