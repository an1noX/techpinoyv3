
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme} 
      className="w-9 px-0"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : ''}`} />
      <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${theme === 'dark' ? '!rotate-0 !scale-100' : ''}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
