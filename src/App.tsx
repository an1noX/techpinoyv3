
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import Index from "./pages/Index";
import Wiki from "./pages/Wiki";
import WikiDetail from "./pages/WikiDetail";
import WikiCreateEdit from "./pages/WikiCreateEdit";
import Printers from "./pages/Printers";
import PrinterDetail from "./pages/PrinterDetail";
import Rentals from "./pages/Rentals";
import RentalDetail from "./pages/RentalDetail";
import RentalCreate from "./pages/RentalCreate";
import Clients from "./pages/Clients";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import TonerProducts from "./pages/TonerProducts";
import Store from "./pages/Store";
import Products from "./pages/Products";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import React from "react";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <PrivateRoute>
      {children}
    </PrivateRoute>
  </AuthProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/store" element={<Store />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<Products />} />
            <Route path="/brands/:brand" element={<Products />} />
            <Route path="/categories/:category" element={<Products />} />
            <Route path="/" element={<ProtectedLayout><Index /></ProtectedLayout>} />
            <Route path="/wiki" element={<ProtectedLayout><Wiki /></ProtectedLayout>} />
            <Route path="/wiki/:id" element={<ProtectedLayout><WikiDetail /></ProtectedLayout>} />
            <Route path="/wiki/new" element={<ProtectedLayout><WikiCreateEdit /></ProtectedLayout>} />
            <Route path="/wiki/edit/:id" element={<ProtectedLayout><WikiCreateEdit /></ProtectedLayout>} />
            <Route path="/printers" element={<ProtectedLayout><Printers /></ProtectedLayout>} />
            <Route path="/printers/:id" element={<ProtectedLayout><PrinterDetail /></ProtectedLayout>} />
            <Route path="/rentals" element={<ProtectedLayout><Rentals /></ProtectedLayout>} />
            <Route path="/rentals/:id" element={<ProtectedLayout><RentalDetail /></ProtectedLayout>} />
            <Route path="/rentals/new" element={<ProtectedLayout><RentalCreate /></ProtectedLayout>} />
            <Route path="/clients" element={<ProtectedLayout><Clients /></ProtectedLayout>} />
            <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />
            <Route path="/toner-products" element={<ProtectedLayout><TonerProducts /></ProtectedLayout>} />
            <Route path="/maintenance" element={<ProtectedLayout><Maintenance /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><Settings /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
