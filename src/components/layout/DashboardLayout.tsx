"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { debug } from "@/lib/debug";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import type { User } from "@supabase/supabase-js";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      debug.debug("auth", "DashboardLayout: Getting user");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        debug.error("auth", "DashboardLayout: Auth error", error);
      }

      debug.info("auth", "DashboardLayout: User retrieved", {
        user: user ? user.email : "No user",
      });
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      debug.info("auth", "DashboardLayout: Auth state changed", {
        user: session?.user ? session.user.email : "No user",
      });
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  if (loading) {
    debug.debug("ui", "DashboardLayout: Loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user is not authenticated, show children without sidebar
  if (!user) {
    debug.debug(
      "auth",
      "DashboardLayout: No user, showing children without sidebar"
    );
    return <>{children}</>;
  }

  // If user is authenticated, show dashboard with sidebar
  debug.success(
    "auth",
    "DashboardLayout: User authenticated, showing dashboard with sidebar"
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </div>
  );
}
