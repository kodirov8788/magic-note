import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientLayout from "@/components/layout/ClientLayout";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "copy-note",
  description: "A magical note-taking application with markdown support",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
