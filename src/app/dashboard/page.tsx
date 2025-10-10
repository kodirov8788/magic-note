import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to root which now shows the dashboard
  redirect("/");
}
