
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Printers from './pages/Printers';
import PrinterDetail from './pages/PrinterDetail';
import Clients from './pages/Clients';
import Auth from './pages/Auth';
import PrivateRoute from './components/PrivateRoute';
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
        
        <Route element={<PrivateRoute />}>
          <Route path="/printers" element={<Printers />} />
          <Route path="/printers/:id" element={<PrinterDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/toner-products" element={<TonerProducts />} />
          <Route path="/toners" element={<Toners />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/wiki/:id" element={<WikiDetail />} />
          <Route path="/wiki/new" element={<WikiCreateEdit />} />
          <Route path="/wiki/edit/:id" element={<WikiCreateEdit />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />
          <Route path="/rentals/new" element={<RentalCreate />} />
          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
          <Route path="/maintenance/new" element={<MaintenanceEdit />} />
          <Route path="/maintenance/new/:printerId" element={<MaintenanceEdit />} />
          <Route path="/maintenance/edit/:id" element={<MaintenanceEdit />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
