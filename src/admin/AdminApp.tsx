import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { ForgotPasswordPage } from "@/admin/pages/ForgotPasswordPage";
import { LoginPage } from "@/admin/pages/LoginPage";
import { ResetPasswordPage } from "@/admin/pages/ResetPasswordPage";
import { PATHS } from "@/admin/paths";

export function AdminApp() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path={PATHS.login} element={<LoginPage />} />
          <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route path={PATHS.home} element={<DashboardPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
