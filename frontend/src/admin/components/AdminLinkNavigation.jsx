import { Link } from "react-router-dom";

export function AdminLinkNavigation() {
  const links = [
    { to: "/admin/users", label: "Users" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/items", label: "Items" },
  ];

  return (
    <nav className="flex gap-4 mb-8">
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className="link-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}