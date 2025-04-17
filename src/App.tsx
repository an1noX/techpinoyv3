
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import Index from "./pages/Index";
import Wiki from "./pages/Wiki";
import WikiDetail from "./pages/WikiDetail";
import WikiCreateEdit from "./pages/WikiCreateEdit";
import Printers from "./pages/Printers";
import PrinterDetail from "./pages/PrinterDetail";
import Rentals from "./pages/Rentals";
import RentalDetail from "./pages/RentalDetail";
import RentalCreate from "./pages/RentalCreate";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/wiki/:id" element={<WikiDetail />} />
            <Route path="/wiki/new" element={<WikiCreateEdit />} />
            <Route path="/wiki/edit/:id" element={<WikiCreateEdit />} />
            <Route path="/printers" element={<Printers />} />
            <Route path="/printers/:id" element={<PrinterDetail />} />
            <Route path="/rentals" element={<Rentals />} />
            <Route path="/rentals/:id" element={<RentalDetail />} />
            <Route path="/rentals/new" element={<RentalCreate />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
