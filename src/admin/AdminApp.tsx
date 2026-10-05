import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AnnouncementEditorPage } from "@/admin/announcements/AnnouncementEditorPage";
import { AnnouncementListPage } from "@/admin/announcements/AnnouncementListPage";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { NewsListPage } from "@/admin/news/NewsListPage";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { ForgotPasswordPage } from "@/admin/pages/ForgotPasswordPage";
import { LoginPage } from "@/admin/pages/LoginPage";
import { ResetPasswordPage } from "@/admin/pages/ResetPasswordPage";
import { PATHS } from "@/admin/paths";

// The text editor is heavy: it is only downloaded when an article is opened.
const NewsEditorPage = lazy(() =>
  import("@/admin/news/NewsEditorPage").then((module) => ({ default: module.NewsEditorPage })),
);

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
              <Route path={PATHS.news} element={<NewsListPage />} />
              <Route path={PATHS.newsNew} element={<NewsEditorPage />} />
              <Route path={`${PATHS.news}/:id`} element={<NewsEditorPage />} />
              <Route path={PATHS.announcements} element={<AnnouncementListPage />} />
              <Route path={PATHS.announcementsNew} element={<AnnouncementEditorPage />} />
              <Route path={`${PATHS.announcements}/:id`} element={<AnnouncementEditorPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
