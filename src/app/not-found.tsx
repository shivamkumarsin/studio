
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 text-center">
      <AlertTriangle className="w-16 h-16 text-destructive mb-6" />
      <h1 className="text-4xl font-headline font-bold mb-3">404 - Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Oops! The page you&apos;re looking for doesn&apos;t seem to exist.
      </p>
      <p className="text-md text-muted-foreground mb-8">
        It might have been moved, deleted, or maybe you just mistyped the URL.
      </p>
      <Link href="/" legacyBehavior passHref>
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Home className="mr-2 h-5 w-5" />
          Go Back to Homepage
        </Button>
      </Link>
    </div>
  );
}
