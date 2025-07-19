export default function Button({ variant = "primary", size = "md", children, className = "", ...props }) {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded transition focus:outline-none focus:ring-2 focus:ring-ring-accent/50";
    
    const variants = {
        primary: "bg-button text-text-white hover:bg-button-hover btn-transition",
        secondary: "gray-btn-transition",
        catalog_disabled: "bg-bg-tertiary text-text-primary hover:bg-button hover:text-text-white transition",
        danger: "clear-btn-transition",
        warning: "warning-btn-transition",
        link: "link-primary"
    };
    
    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-5 py-2",
        lg: "px-6 py-3",
        xs: "px-2 py-2 text-sm",
        xl: "px-8 py-4 text-lg"
    };
    
    return (
        <button 
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} cursor-pointer`}
            {...props}
        >
            {children}
        </button>
    );
}