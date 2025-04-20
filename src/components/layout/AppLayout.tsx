
import React from 'react';
import { Outlet } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import { BottomNavigation } from './BottomNavigation';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />
      
      <main className="flex-grow pt-14 pb-16">
        <Outlet />
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
