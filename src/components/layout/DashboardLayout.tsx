"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { debug } from "@/lib/debug";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
  refreshTrigger?: number;
}

export function DashboardLayout({
  children,
  refreshTrigger,
}: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - fixed position */}
        <DashboardSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          refreshTrigger={refreshTrigger}
        />

        {/* Main content - responsive margin */}
        <main
          className={`flex-1 overflow-auto transition-all duration-300 lg:ml-64 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          {/* Mobile menu button */}
          {!sidebarOpen && (
            <div className="lg:hidden fixed top-4 right-4 z-30">
              <Button
                size="md"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="shadow-lg"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
