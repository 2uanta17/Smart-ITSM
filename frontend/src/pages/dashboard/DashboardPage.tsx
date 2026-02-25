import { useAuthStore } from "@/stores/authStore";
import { AdminDashboard } from "./AdminDashboard";
import { RequesterDashboard } from "./RequesterDashboard";

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const isAdminOrTech = user?.role === "Admin" || user?.role === "Technician";

  return isAdminOrTech ? <AdminDashboard /> : <RequesterDashboard />;
};