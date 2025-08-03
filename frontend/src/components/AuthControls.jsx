import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ThemeSlider from "./ThemeSlider";
import LoadingIcon from "./LoadingIcon";
import Button from "./Button";

export function AuthControls() {
    const { isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <LoadingIcon />;
    }
    return (
        <div className="flex items-center gap-4">
            {isAuthenticated ? <ProfileMenu /> : <LoginButton />}
        </div>
    );
}

export function LoginButton() {
    const { loginWithRedirect } = useAuth0();

    return (
        <Button variant="primary" onClick={() => loginWithRedirect()}>
            Sign In
        </Button>
    );
}

export function LogoutButton() {
    const { logout } = useAuth0();
    return (
        <Button
            variant="warning"
            onClick={() => {
                localStorage.clear();
                logout({ logoutParams: { returnTo: window.location.origin } });
            }}
            className="w-full">
            Log Out
        </Button>
    );
}

export function ProfileMenu() {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [open, setOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
        }
        if (open) {
            document.addEventListener("mousedown", handleClick);
            return () => document.removeEventListener("mousedown", handleClick);
        }
    }, [open]);

    if (!isAuthenticated || isLoading) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                className="flex items-center gap-2 transition-transform hover:scale-icon-medium cursor-pointer"
                onClick={() => setOpen(!open)}
                aria-label="Open profile menu"
            >
                <img
                    src={user.picture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-border-muted shadow-sm transition-transform"
                />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-bg-secondary rounded-xl shadow-lg border border-border-muted p-4 animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div className="min-w-0">
                            <div className="font-semibold text-text-primary truncate">{user.name}</div>
                            <div className="text-xs text-text-muted truncate max-w-[140px]">{user.email}</div>
                        </div>
                    </div>
                    <div className="pt-1 flex flex-col w-full space-y-1">
                        <div className="flex items-center justify-between px-3 py-2">
                            <span className="text-text-primary font-medium">Dark Mode</span>
                            <ThemeSlider />
                        </div>
                        <Link
                            to="/account"
                            className="w-full px-3 py-2 rounded text-text-primary hover:bg-bg-tertiary transition font-medium"
                            onClick={() => setOpen(false)}
                        >
                            Order History
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            )}
        </div>
    );
}