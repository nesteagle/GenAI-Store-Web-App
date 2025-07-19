import { Link } from "react-router-dom";
import Icon from "./Icon";
import Container from "./Container";

export default function Footer() {
    return (
        <footer className="bg-bg-secondary text-text-muted border-t border-border-muted py-6 px-4 transition-colors duration-200 relative">
            <Container className="flex flex-col md:flex-row items-center justify-between gap-4">                <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-button/10">
                    <Icon name="check" className="text-text-accent" />
                </span>
                <span className="font-display text-lg font-bold text-text-primary tracking-tight">nesteagle</span>
            </div>
                <div className="text-sm text-text-muted">
                    © {new Date().getFullYear()} <Link to="https://github.com/nesteagle" className="link-primary">nesteagle</Link>. All rights reserved.
                </div>
            </Container>
            <div className="absolute left-0 top-0 w-full h-1 bg-gradient-to-r from-accent/30 via-accent/0 to-accent/30 pointer-events-none" />
        </footer>
    );
}