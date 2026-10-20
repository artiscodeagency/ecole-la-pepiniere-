import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdmissionDetailPage } from "@/admin/admissions/AdmissionDetailPage";
import { AdmissionListPage } from "@/admin/admissions/AdmissionListPage";
import { AnnouncementEditorPage } from "@/admin/announcements/AnnouncementEditorPage";
import { AnnouncementListPage } from "@/admin/announcements/AnnouncementListPage";
import { AuthProvider } from "@/admin/auth/AuthProvider";
import { RequireAuth } from "@/admin/auth/RequireAuth";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { DocumentEditorPage } from "@/admin/documents/DocumentEditorPage";
import { DocumentListPage } from "@/admin/documents/DocumentListPage";
import { EventEditorPage } from "@/admin/events/EventEditorPage";
import { EventListPage } from "@/admin/events/EventListPage";
import { AlbumsPage } from "@/admin/gallery/AlbumsPage";
import { GalleryPage } from "@/admin/gallery/GalleryPage";
import { MessageDetailPage } from "@/admin/messages/MessageDetailPage";
import { MessageListPage } from "@/admin/messages/MessageListPage";
import { NewsListPage } from "@/admin/news/NewsListPage";
import { DashboardPage } from "@/admin/pages/DashboardPage";
import { ForgotPasswordPage } from "@/admin/pages/ForgotPasswordPage";
import { LoginPage } from "@/admin/pages/LoginPage";
import { ResetPasswordPage } from "@/admin/pages/ResetPasswordPage";
import { PATHS } from "@/admin/paths";
import { SchoolInfoPage } from "@/admin/school/SchoolInfoPage";
import { ProfilePage } from "@/admin/users/ProfilePage";
import { UsersPage } from "@/admin/users/UsersPage";

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
              <Route path={PATHS.events} element={<EventListPage />} />
              <Route path={PATHS.eventsNew} element={<EventEditorPage />} />
              <Route path={`${PATHS.events}/:id`} element={<EventEditorPage />} />
              <Route path={PATHS.gallery} element={<GalleryPage />} />
              <Route path={`${PATHS.gallery}/albums`} element={<AlbumsPage />} />
              <Route path={PATHS.documents} element={<DocumentListPage />} />
              <Route path={PATHS.documentsNew} element={<DocumentEditorPage />} />
              <Route path={`${PATHS.documents}/:id`} element={<DocumentEditorPage />} />
              <Route path={PATHS.messages} element={<MessageListPage />} />
              <Route path={`${PATHS.messages}/:id`} element={<MessageDetailPage />} />
              <Route path={PATHS.admissions} element={<AdmissionListPage />} />
              <Route path={`${PATHS.admissions}/:id`} element={<AdmissionDetailPage />} />
              <Route path={PATHS.schoolInfo} element={<SchoolInfoPage />} />
              <Route path={PATHS.users} element={<UsersPage />} />
              <Route path={PATHS.profile} element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to={PATHS.home} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
