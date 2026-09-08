'use client';

import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react'; // Assuming you have lucide-react installed for icons

export default function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="justify-start text-muted-foreground hover:text-foreground"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
