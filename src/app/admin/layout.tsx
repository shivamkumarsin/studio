
"use client"; // Required because we use useAuth hook

import type { Metadata } from 'next'; // Keep for potential static metadata
import { Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { useRouter } from 'next/navigation'; // To redirect

// export const metadata: Metadata = { // This needs to be static if used
//   title: "Admin - Amrit's Photo Stack",
//   description: "Admin panel for Amrit's Photo Stack.",
// };
// If you need dynamic title based on auth, you'd set it in the page component or useEffect.

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, signOut, loading } = useAuth(); // Use the auth context
  const router = useRouter();

  // Handle logout
  const handleSignOut = async () => {
    await signOut();
    // signOut in AuthProvider already redirects to /login
  };

  // While loading auth state, you might want to show a loader or nothing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-xl">Loading admin area...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login (though page.tsx might also do this)
  // This provides an additional layer of protection for the layout itself
  if (!user) {
    if (typeof window !== 'undefined') { // Ensure router.push is client-side
      router.push('/login');
    }
    return null; // Or a loading/redirecting message
  }
  
  // Check if the authenticated user is the allowed admin
  if (user.email !== 'amritkumarchanchal@gmail.com') {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You are not authorized to access this admin panel.</p>
        <Button onClick={() => router.push('/')} variant="outline">Go to Homepage</Button>
        <Button onClick={handleSignOut} variant="ghost" className="mt-4 text-sm">Sign Out</Button>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-headline flex items-center gap-3">
            <Camera className="h-8 w-8" />
            Amrit's Photo Stack - Admin
          </h1>
          {user && ( // Show sign out button if user is logged in
            <Button onClick={handleSignOut} variant="ghost" className="hover:bg-primary/80">
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center mt-auto">
        <p className="font-body text-sm">&copy; {new Date().getFullYear()} Amrit's Photo Stack - Admin. All rights reserved.</p>
      </footer>
    </div>
  );
}
