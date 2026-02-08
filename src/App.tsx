import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import SalesRegister from "./pages/SalesRegister";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Items from "./pages/Items";
import DeliveryChallans from "./pages/DeliveryChallans";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    <Route path="/" element={
      <ProtectedRoute>
        <AppLayout>
          <Dashboard />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/create-invoice" element={
      <ProtectedRoute>
        <AppLayout>
          <CreateInvoice />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/sales-register" element={
      <ProtectedRoute>
        <AppLayout>
          <SalesRegister />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/customers" element={
      <ProtectedRoute>
        <AppLayout>
          <Customers />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/customers/:id" element={
      <ProtectedRoute>
        <AppLayout>
          <CustomerDetail />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/items" element={
      <ProtectedRoute>
        <AppLayout>
          <Items />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="/delivery-challans" element={
      <ProtectedRoute>
        <AppLayout>
          <DeliveryChallans />
        </AppLayout>
      </ProtectedRoute>
    } />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
