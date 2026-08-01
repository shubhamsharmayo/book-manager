"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  BookMarked,
  CheckCircle,
  LogOut,
} from "lucide-react";


const backendUrl = process.env.NEXT_PUBLIC_NODE_API_URL;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    {
      name: "Home",
      href: "/books",
      icon: Home,
    },
    {
      name: "Browse By Status",
      href: "/status",
      icon: BookOpen,
    },
    // {
    //   name: "Reading",
    //   href: "/books/reading",
    //   icon: BookMarked,
    // },
    // {
    //   name: "Completed",
    //   href: "/books/completed",
    //   icon: CheckCircle,
    // },
  ];

  const handleLogout = async () => {
    try {
      await fetch(
        `${backendUrl}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      localStorage.removeItem('userId')
      router.push("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white shadow-md">
      {/* Logo */}
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold text-blue-600">
          Book Manager
        </h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                    pathname === item.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-white transition hover:bg-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}