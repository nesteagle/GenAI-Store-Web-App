export default function LoadingIcon({message = "Loading..."}) {
    return (
        <div
            className="flex items-center gap-3 select-none"
            role="status"
            aria-live="polite"
        >
            <span className="relative flex h-8 w-8">
                <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--color-accent)] via-[var(--color-button)] to-[var(--color-text-accent)] opacity-20 blur-[2px]" />
                <svg
                    className="w-8 h-8 animate-spin"
                    style={{ animationDuration: '1s' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-20"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="var(--color-text-muted)"
                        strokeWidth="4"
                    />
                    <path
                        className="origin-center"
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="var(--color-accent)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>
            </span>
            <span className="text-base font-medium text-text-muted animate-pulse tracking-wide">
                {message}
            </span>
        </div>
    );
}
