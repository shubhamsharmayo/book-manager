import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto ">
        {children}
      </main>
    </div>
  );
}