import { MainLayout } from "@/components/layout/MainLayout";
import { AssetsPage } from "@/pages/assets/AssetsPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DepartmentsPage } from "@/pages/departments/DepartmentsPage";
import { CreateTicketPage } from "@/pages/tickets/CreateTicketPage";
import { TicketDetailPage } from "@/pages/tickets/TicketDetailPage";
import { TicketListPage } from "@/pages/tickets/TicketListPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { Navigate, Route, Routes } from "react-router-dom";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<MainLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="tickets" element={<TicketListPage />} />
          <Route path="tickets/create" element={<CreateTicketPage />} />
          <Route path="tickets/:id" element={<TicketDetailPage />} />
          <Route
            element={<ProtectedRoute allowedRoles={["Admin", "Technician"]} />}
          >
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="assets" element={<AssetsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
