// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./layout/AppLayout";
import { Toaster } from "react-hot-toast";

/* -------- PAGES -------- */
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Policies from "./pages/Policies";
import Renewals from "./pages/Renewals";
import Claims from "./pages/Claims";
import Settings from "./pages/Settings";
import Lead from "./pages/Lead";
import Product from "./pages/Product";
import Campaign from "./pages/Campaign ";
import Insurer from "./pages/Insurer";
import TasksPage from "./pages/TasksPage";
import AdminAdvisorsByStatusPage from "./pages/AdminAdvisorsByStatusPage";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import Users from "./pages/Users";

/* -------- RBAC -------- */
import { ProtectedRoute as RBACProtectedRoute } from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ================= PROTECTED + LAYOUT ================= */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* ✅ dashboard:view */}
            <Route
              path="/"
              element={
                <RBACProtectedRoute module="dashboard" action="view">
                  <Dashboard />
                </RBACProtectedRoute>
              }
            />

            {/* ✅ lead:view */}
            <Route
              path="/leads"
              element={
                <RBACProtectedRoute module="lead" action="view">
                  <Lead />
                </RBACProtectedRoute>
              }
            />

            {/* ✅ lead:view */}
            <Route
              path="/users"
              element={
                <RBACProtectedRoute module="user" action="view">
                  <Users />
                </RBACProtectedRoute>
              }
            />

            {/* ✅ followup:view (mapped to Customers) */}
            <Route
              path="/customers"
              element={
                <RBACProtectedRoute module="followup" action="view">
                  <Customers />
                </RBACProtectedRoute>
              }
            />

            // src/App.tsx - Add this route
            <Route
              path="/tasks"
              element={
                <RBACProtectedRoute module="task" action="view">
                  <Tasks />
                </RBACProtectedRoute>
              }
            />

            {/* ✅ order:view (mapped to Policies) */}
            <Route
              path="/policies"
              element={
                <RBACProtectedRoute module="order" action="view">
                  <Policies />
                </RBACProtectedRoute>
              }
            />

            {/* TODO: Add insurer module to backend */}
            <Route path="/insurer" element={<Insurer />} />

            {/* TODO: Add renewals module to backend */}
            <Route path="/renewals" element={<Renewals />} />

            {/* TODO: Add claims module to backend */}
            <Route path="/claims" element={<Claims />} />

            {/* ✅ settings:view */}
            <Route
              path="/settings"
              element={
                <RBACProtectedRoute module="settings" action="view">
                  <Settings />
                </RBACProtectedRoute>
              }
            />

            {/* ✅ campaign:view */}
            <Route
              path="/campaign"
              element={
                <RBACProtectedRoute module="campaign" action="view">
                  <Campaign />
                </RBACProtectedRoute>
              }
            />

            {/* TODO: Add products module to backend */}
            <Route path="/products" element={<Product />} />

            {/* ✅ task:view */}
            <Route
              path="/tasks"
              element={
                <RBACProtectedRoute module="task" action="view">
                  <TasksPage />
                </RBACProtectedRoute>
              }
            />

            {/* -------- ADMIN ROUTES -------- */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/history" element={<AdminAdvisorsByStatusPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;