
"use client"; 

import { useEffect } from 'react'; 
import { Images, LogOut } from "lucide-react"; // Changed Camera to Images
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context"; 
import { useRouter } from 'next/navigation'; 


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, signOut, loading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  
  const handleSignOut = async () => {
    await signOut();
    
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-xl">Loading admin area...</p>
      </div>
    );
  }

  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-xl">Redirecting to login...</p>
      </div>
    );
  }
  
  
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
            <Images className="h-8 w-8" /> {/* Changed Camera to Images */}
            Amrit's Photo Stack - Admin
          </h1>
          {user && ( 
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
