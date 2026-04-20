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
import Settings from "./pages/Settings";
import Lead from "./pages/Lead";
import Product from "./pages/Product";
import TasksPage from "./pages/TasksPage";
import AdminAdvisorsByStatusPage from "./pages/AdminAdvisorsByStatusPage";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import Users from "./pages/Users";
import AIAssistant from "./pages/AIAssistant";
import BookingDemoList from "./pages/BookingDemoList";

/* -------- RBAC -------- */
import { ProtectedRoute as RBACProtectedRoute } from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Teams from "./pages/Teams";
import Quotations from "./pages/Quotations";
import LeadFollowup from "./pages/LeadFollowup";
import Orders from "./pages/Orders";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Expenses from "./pages/Expenses";
import SmartRedirect from "./components/SmartRedirect";
import QuickBooksSuccess from "./pages/QuickBooksSuccess";
import QuickBookCustomers from "./pages/QuickBookCustomers";
import QuickBookInvoices from "./pages/QuickBookInvoices";
import Invoices from "./pages/Invoices";
import ReportsOverview from "./pages/ReportsOverview";
import Home from "./pages/Landing/Home";
import About from "./pages/Landing/About";
// import Pricing from "./pages/Landing/Pricing";
import Loginai from "./pages/Landing/Login";
import Signup from "./pages/Landing/Signup";
import PublicLayout from "./pages/Publiclayouts/Publiclayout";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import UserCredits from "./pages/UserCredits";
import CreditTransactions from "./pages/CreditTransactions";


function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ================= */}

          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* <Route path="/pricing" element={<Pricing />} /> */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Loginai />} />
            <Route path="/register" element={<Register />} />
          </Route>


          <Route path="/login/admin" element={<Admin />} />
          <Route path="/login/superadmin" element={<SuperAdminLogin />} />

          <Route path="/unauthorized" element={<Unauthorized />} />


          {/* ================= PROTECTED + LAYOUT ================= */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >

            <Route path="/redirect" element={<SmartRedirect />} />
            {/* dashboard:view */}
            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />

            {/* lead:view */}
            <Route
              path="/leads"
              element={
                <RBACProtectedRoute module="lead" action="view">
                  <Lead />
                </RBACProtectedRoute>
              }
            />

            <Route
              path="/LeadFollowup/:leadId"
              element={
                <RBACProtectedRoute module="lead" action="view">
                  <LeadFollowup />
                </RBACProtectedRoute>

              }
            />

            {/* team:view (mapped to Customers) */}
            <Route
              path="/quotations"
              element={
                <RBACProtectedRoute module="quotation" action="view">
                  <Quotations />
                </RBACProtectedRoute>
              }
            />


            {/* lead:view */}
            <Route
              path="/users"
              element={
                <RBACProtectedRoute module="user" action="view">
                  <Users />
                </RBACProtectedRoute>
              }
            />



            {/* followup:view (mapped to Customers) */}
            <Route
              path="/projects"
              element={
                <RBACProtectedRoute module="project" action="view">
                  <Projects />
                </RBACProtectedRoute>
              }
            />

            {/* followup:view (mapped to Customers) */}
            <Route
              path="/expenses"
              element={
                <RBACProtectedRoute module="expense" action="view">
                  <Expenses />
                </RBACProtectedRoute>
              }
            />

            {/* followup:view (mapped to Customers) */}
            <Route
              path="/clients"
              element={
                <RBACProtectedRoute module="client" action="view">
                  <Clients />
                </RBACProtectedRoute>
              }
            />

            {/* task:view (mapped to Customers) */}
            <Route
              path="/tasks"
              element={
                <RBACProtectedRoute module="task" action="view">
                  <Tasks />
                </RBACProtectedRoute>
              }
            />

            {/* team:view (mapped to Customers) */}
            <Route
              path="/teams"
              element={
                <RBACProtectedRoute module="team" action="view">
                  <Teams />
                </RBACProtectedRoute>
              }
            />


            {/* order:view */}

            <Route
              path="/orders"
              element={
                <RBACProtectedRoute module="order" action="view">
                  <Orders />
                </RBACProtectedRoute>
              }
            />

            <Route
              path="/invoices"
              element={
                <RBACProtectedRoute module="invoice" action="view">
                  <Invoices />
                </RBACProtectedRoute>
              }
            />


            {/* settings:view */}
            <Route
              path="/settings"
              element={
                <RBACProtectedRoute module="settings" action="view">
                  <Settings />
                </RBACProtectedRoute>
              }
            />


            {/* TODO: Add products module to backend */}
            <Route path="/products" element={<Product />} />

            {/* task:view */}
            <Route
              path="/tasks"
              element={
                <RBACProtectedRoute module="task" action="view">
                  <TasksPage />
                </RBACProtectedRoute>
              }
            />
            <Route
              path="/quickbook-customers"
              element={<QuickBookCustomers />}
            />
            <Route
              path="/quickbook-invoices"
              element={<QuickBookInvoices />}
            />
            <Route path="/quickbooks-success" element={<QuickBooksSuccess />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />

            <Route
              path="/reports"
              element={<ReportsOverview />}
            />

            {/* -------- ADMIN ROUTES -------- */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/history" element={<AdminAdvisorsByStatusPage />} />
            <Route path="/booking-demo" element={<BookingDemoList />} />
            <Route path="/admin/credits" element={<UserCredits />} />
            <Route path="/admin/credits/:userId" element={<CreditTransactions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;