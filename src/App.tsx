
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Printers from './pages/Printers';
import PrinterDetail from './pages/PrinterDetail';
import Clients from './pages/Clients';
import Auth from './pages/Auth';
import { PrivateRoute } from './components/PrivateRoute';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Store from './pages/Store';
import TonerProducts from './pages/TonerProducts';
import Toners from './pages/Toners';
import Wiki from './pages/Wiki';
import WikiDetail from './pages/WikiDetail';
import WikiCreateEdit from './pages/WikiCreateEdit';
import Rentals from './pages/Rentals';
import RentalDetail from './pages/RentalDetail';
import RentalCreate from './pages/RentalCreate';
import SystemSettings from './pages/SystemSettings';
import MaintenanceList from './pages/MaintenanceList';
import MaintenanceDetail from './pages/MaintenanceDetail';
import MaintenanceEdit from './pages/MaintenanceEdit';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/store" element={<Store />} />
        <Route path="/products" element={<Products />} />
        
        {/* Dashboard is the default landing page after login */}
        <Route path="/dashboard" element={<PrivateRoute><Printers /></PrivateRoute>} />
        
        <Route path="/printers" element={<PrivateRoute><Printers /></PrivateRoute>} />
        <Route path="/printers/:id" element={<PrivateRoute><PrinterDetail /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/toner-products" element={<PrivateRoute><TonerProducts /></PrivateRoute>} />
        <Route path="/toners" element={<PrivateRoute><Toners /></PrivateRoute>} />
        <Route path="/wiki" element={<PrivateRoute><Wiki /></PrivateRoute>} />
        <Route path="/wiki/:id" element={<PrivateRoute><WikiDetail /></PrivateRoute>} />
        <Route path="/wiki/new" element={<PrivateRoute><WikiCreateEdit /></PrivateRoute>} />
        <Route path="/wiki/edit/:id" element={<PrivateRoute><WikiCreateEdit /></PrivateRoute>} />
        <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
        <Route path="/rentals/:id" element={<PrivateRoute><RentalDetail /></PrivateRoute>} />
        <Route path="/rentals/new" element={<PrivateRoute><RentalCreate /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SystemSettings /></PrivateRoute>} />
        <Route path="/maintenance" element={<PrivateRoute><MaintenanceList /></PrivateRoute>} />
        <Route path="/maintenance/:id" element={<PrivateRoute><MaintenanceDetail /></PrivateRoute>} />
        <Route path="/maintenance/new" element={<PrivateRoute><MaintenanceEdit /></PrivateRoute>} />
        <Route path="/maintenance/new/:printerId" element={<PrivateRoute><MaintenanceEdit /></PrivateRoute>} />
        <Route path="/maintenance/edit/:id" element={<PrivateRoute><MaintenanceEdit /></PrivateRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
