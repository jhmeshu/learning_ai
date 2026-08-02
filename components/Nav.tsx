"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/recurring", label: "Recurring" },
  { href: "/budgets", label: "Budgets" },
  { href: "/reports", label: "Reports" },
  { href: "/categories", label: "Categories" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="topnav">
      <Link href="/" className="brand">
        Money Tracker
      </Link>
      <div className="nav-links">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${
              pathname === link.href ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
