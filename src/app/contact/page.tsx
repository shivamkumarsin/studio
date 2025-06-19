
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Home, Camera } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-card text-card-foreground py-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl md:text-3xl font-headline flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <Camera className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            Amrit's Photo Stack
          </Link>
          <nav className="flex items-center gap-1 md:gap-3">
            <Link href="/" legacyBehavior passHref>
              <Button variant="ghost" className="text-sm md:text-base hover:text-primary">
                <Home className="mr-1.5 h-4 w-4" /> Home
              </Button>
            </Link>
             <Link href="/admin" legacyBehavior passHref>
                <Button variant="ghost" className="text-sm md:text-base hover:text-primary">Admin</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-16 md:py-24 flex items-center justify-center">
        <div className="text-center max-w-lg p-8 md:p-12 bg-card shadow-xl rounded-xl">
          <Mail className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-6">Get in Touch</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Have questions, want to collaborate, or just say hello? I'd love to hear from you!
          </p>
          <p className="text-md md:text-lg text-muted-foreground mb-4">
            The best way to reach me is via email:
          </p>
          <a
            href="mailto:amritkumarchanchal@gmail.com"
            className="text-xl md:text-2xl font-semibold text-accent hover:text-accent/80 transition-colors break-all"
          >
            amritkumarchanchal@gmail.com
          </a>
          <div className="mt-10">
            <Link href="/" legacyBehavior passHref>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary-foreground">
                <Home className="mr-2 h-5 w-5" />
                Back to Gallery
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-8 mt-auto">
        <div className="container mx-auto px-4 text-center">
            <Link href="/" className="text-xl font-headline flex items-center justify-center gap-2 hover:opacity-80 transition-opacity mb-2">
              <Camera className="h-6 w-6 text-primary" />
              Amrit's Photo Stack
            </Link>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            A personal collection of aesthetic photos by Amrit Kumar Chanchal.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Amrit Kumar Chanchal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
