import React from "react";
import { Routes, Route } from "react-router-dom";

// Public pages
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import SignupPage from "../pages/Auth/SignupPage";

// Protected pages
import DashboardPage from "../pages/Dashboard/DashboardPage";
import CommunityPage from "../pages/Community/CommunityPage";
import CreateCommunityPage from "../pages/Community/CreateCommunityPage";
import JoinCommunityPage from "../pages/Community/JoinCommunityPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ResourcePage from "../pages/Resource/ResourcePage";

// System pages
import NotFoundPage from "../pages/NotFound/NotFoundPage";

// Route guards
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community/create"
        element={
          <ProtectedRoute>
            <CreateCommunityPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community/join"
        element={
          <ProtectedRoute>
            <JoinCommunityPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/community/:communityId"
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources/:communityId"
        element={
          <ProtectedRoute>
            <ResourcePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
