
import React from 'react';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
  fab?: React.ReactNode;
}

export function MobileLayout({ children, fab }: MobileLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      
      {fab && (
        <div className="fixed right-4 bottom-20 z-10">
          {fab}
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
}
