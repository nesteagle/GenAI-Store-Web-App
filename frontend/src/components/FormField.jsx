export default function FormField({ label, id, type = "text", name, value, onChange, required = false, width = "w-14", className="", ...rest }) {
    return (
        <div className="mb-4">
            {label && (
                <label
                    htmlFor={id}
                    className="block mb-1 text-sm font-medium text-text-primary"
                >
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}
            <input
                id={id}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`${width} px-3 py-2 rounded border border-border-muted bg-bg-tertiary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring-accent/50 ${className}`}
                {...rest}
            />
        </div>
    );
}