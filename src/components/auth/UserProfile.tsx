
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function UserProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <Button variant="outline" onClick={() => navigate('/auth')}>
        Sign In
      </Button>
    );
  }

  const email = user.email || '';
  const displayName = email.split('@')[0] || 'User';
  const initials = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src="" alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="grid gap-0.5 text-sm">
        <div className="font-medium">{displayName}</div>
        <div className="text-xs text-muted-foreground">{email}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        Log out
      </Button>
    </div>
  );
}
