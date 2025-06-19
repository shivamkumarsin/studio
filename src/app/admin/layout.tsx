import type { Metadata } from 'next';
import { Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin - Amrit's Photo Stack",
  description: "Admin panel for Amrit's Photo Stack.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-headline flex items-center gap-3">
            <Camera className="h-10 w-10" />
            Amrit's Photo Stack - Admin Panel
          </h1>
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
