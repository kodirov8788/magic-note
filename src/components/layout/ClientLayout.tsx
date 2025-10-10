"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Listen for note save events
    const handleNoteSaved = () => {
      setRefreshTrigger((prev: number) => prev + 1);
    };

    window.addEventListener("noteSaved", handleNoteSaved);
    return () => window.removeEventListener("noteSaved", handleNoteSaved);
  }, []);

  return (
    <DashboardLayout refreshTrigger={refreshTrigger}>
      {children}
    </DashboardLayout>
  );
}
