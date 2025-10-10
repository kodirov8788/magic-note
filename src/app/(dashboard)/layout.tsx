export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout only provides the content area
  // The sidebar is handled by the root DashboardLayout component
  return <>{children}</>;
}
