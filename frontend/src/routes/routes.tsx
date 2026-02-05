import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { DepartmentsPage } from "@/pages/departments/DepartmentsPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { AssetsPage } from "@/pages/assets/AssetsPage";
import { CreateTicketPage } from "@/pages/tickets/CreateTicketPage";
import { TicketListPage } from "@/pages/tickets/TicketListPage";
import { TicketDetailPage } from "@/pages/tickets/TicketDetailPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<MainLayout />}>
          <Route path="dashboard" element={<div>Dashboard</div>} />
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
