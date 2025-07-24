import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthControls } from './AuthControls';
import { useAuth0 } from "@auth0/auth0-react";
import ShoppingCartButton from './ShoppingCartButton';
import Button from './Button';
import Icon from './Icon';
import Container from './Container';
import ChatWidget from './ChatComponents';

export default function StoreHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth0();

    function Links({ type = "base" }) {
        const baseClass = "text-text-primary font-medium";
        const typeClass = type === "base"
            ? "sm:text-lg link-underline-transition"
            : "p-2 rounded hover:bg-bg-tertiary transition";
        const links = [
            { to: "/", text: "Home" },
            { to: "/catalog", text: "Catalog" },
            ...(isAuthenticated ? [{ to: "/account", text: "Account" }] : [])
        ];
        return (
            <>
                {links.map(link => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className={`${baseClass} ${typeClass}`}
                        {...(type !== "base" && { onClick: () => setMenuOpen(false) })}
                    >
                        {link.text}
                    </Link>
                ))}
            </>
        );
    }

    return (
        <header className="bg-bg-secondary shadow-md border-b border-border-muted sticky top-0 z-20 transition-colors duration-200">
            <Container className="flex items-center justify-between py-3 sm:py-4">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center group">
                        <span className="inline-block bg-button/10 rounded-full p-2 mr-2">
                            <Icon name="check" size={36} className="text-text-accent hover:scale-icon-small transition-transform" />
                        </span>
                        <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary group-hover:text-text-accent transition-colors">
                            nesteagle's store
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex gap-6">
                    <Links type="base" />
                </nav>

                <div className="flex items-center gap-3 sm:gap-4">
                    <ShoppingCartButton />
                    <AuthControls />
                    <Button variant="secondary" size="xs" onClick={() => setMenuOpen((v) => !v)} className="md:hidden">
                        <Icon name="mobile" className="text-text-primary" />
                    </Button>
                    <ChatWidget/>
                </div>
            </Container>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-bg-secondary border-t border-border-muted shadow-lg absolute w-full left-0 top-full z-30 animate-fade-in">
                    <nav className="flex flex-col gap-2 px-4 py-3">
                        <Links type="mobile" />
                    </nav>
                </div>
            )}
        </header>
    );
}
