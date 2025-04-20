
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileSidebarProps {
  navigation: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

export function MobileSidebar({ navigation }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4 mt-8">
          {navigation.map((item, i) => (
            <Link 
              key={i} 
              to={item.href}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md hover:bg-muted"
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
