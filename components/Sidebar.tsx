"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ArrowLeftRight,
  Wallet,
  Users,
  BoxSelect,
  ClipboardList,
  User,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "HRM",
    icon: <Building2 size={28} strokeWidth={1.5} />,
    href: "/HRM",
  },
  {
    label: "Transfer",
    icon: <ArrowLeftRight size={28} strokeWidth={1.5} />,
    href: "/Transfer",
  },
  {
    label: "Accounting",
    icon: <Wallet size={28} strokeWidth={1.5} />,
    href: "/Accounting",
  },
  {
    label: "People",
    icon: <Users size={28} strokeWidth={1.5} />,
    children: [
      { label: "Customers", href: "/People/Customers" },
      { label: "Suppliers", href: "/People/Suppliers" },
      { label: "Users", href: "/People/users" },
    ],
  },
  {
    label: "Projects",
    icon: <BoxSelect size={28} strokeWidth={1.5} />,
    href: "/Projects",
  },
  {
    label: "Tasks",
    icon: <ClipboardList size={28} strokeWidth={1.5} />,
    href: "/Tasks",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(() => {
    // Auto-open People section if current path is under /People
    if (typeof window !== "undefined") return null;
    return null;
  });

  // Determine which section is active based on path
  const isPeopleActive = pathname.startsWith("/People");
  const activeSection = isPeopleActive ? "People" : openSection;

  function handleNavClick(item: NavItem) {
    if (item.children) {
      setOpenSection((prev) => (prev === item.label ? null : item.label));
    } else {
      setOpenSection(null);
    }
  }

  const isSubOpen = (item: NavItem) =>
    item.children &&
    (activeSection === item.label || openSection === item.label);

  return (
    <div className="flex h-screen">
      {/* Main sidebar */}
      <aside className="flex flex-col w-[120px] bg-white border-r border-gray-200 shadow-sm py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href
              ? pathname.startsWith(item.href)
              : item.children?.some((c) => pathname.startsWith(c.href));

          const isOpen = isSubOpen(item);

          return (
            <div key={item.label} className="relative">
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-4 w-full border-b border-gray-100 transition-colors
                    ${isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-500"}`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-4 w-full border-b border-gray-100 transition-colors cursor-pointer
                    ${isActive ? "text-purple-600" : "text-gray-600 hover:text-purple-500"}`}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                  {/* Active triangle indicator */}
                  {isOpen && (
                    <span
                      className="absolute bottom-0 right-0 w-0 h-0"
                      style={{
                        borderLeft: "14px solid transparent",
                        borderBottom: "14px solid #7c3aed",
                      }}
                    />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </aside>

      {/* Sub-menu panel */}
      {navItems.map((item) => {
        if (!item.children) return null;
        const isOpen = isSubOpen(item);
        if (!isOpen) return null;

        return (
          <div
            key={`sub-${item.label}`}
            className="w-[180px] bg-white border-r border-gray-200 shadow-md py-6 flex flex-col gap-1"
          >
            {item.children.map((child) => {
              const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors rounded-md mx-2
                    ${childActive ? "text-purple-600" : "text-gray-700 hover:text-purple-500"}`}
                >
                  <User
                    size={18}
                    strokeWidth={1.5}
                    className={childActive ? "text-purple-600" : "text-gray-500"}
                  />
                  {child.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
