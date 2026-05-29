'use client';

import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react'; // Assuming you have lucide-react installed for icons

export default function LogoutButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-3"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  );
}
