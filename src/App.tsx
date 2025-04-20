
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
            <Route path="/wiki" element={<PrivateRoute><Wiki /></PrivateRoute>} />
            <Route path="/wiki/:id" element={<PrivateRoute><WikiDetail /></PrivateRoute>} />
            <Route path="/wiki/new" element={<PrivateRoute><WikiCreateEdit /></PrivateRoute>} />
            <Route path="/wiki/edit/:id" element={<PrivateRoute><WikiCreateEdit /></PrivateRoute>} />
            <Route path="/printers" element={<PrivateRoute><Printers /></PrivateRoute>} />
            <Route path="/printers/:id" element={<PrivateRoute><PrinterDetail /></PrivateRoute>} />
            <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
            <Route path="/rentals/:id" element={<PrivateRoute><RentalDetail /></PrivateRoute>} />
            <Route path="/rentals/new" element={<PrivateRoute><RentalCreate /></PrivateRoute>} />
            <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
