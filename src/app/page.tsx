"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { PhotoGrid } from "@/components/photo-grid";
import type { Photo } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Images, 
  Mail, 
  Star, 
  ChevronDown, 
  UserCircle, 
  Camera,
  Sparkles,
  Eye,
  Award,
  Menu,
  Grid3X3,
  ArrowRight,
  Album,
  GraduationCap,
  Briefcase,
  BarChart3,
  Palette
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { WeeklyHighlights } from "@/components/weekly-highlights";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const HERO_BACKDROP_IMAGE_URL = "https://cdn.pixabay.com/photo/2017/11/02/09/16/christmas-2910468_1280.jpg";
const PROFILE_IMAGE_URL = "https://certify.amritkumarchanchal.me/amrit-kumar-chanchal.png";

export default function PublicHomePage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightPhotos, setHighlightPhotos] = useState<Photo[]>([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);
  const { toast } = useToast();
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState<Photo | null>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    setIsLoading(true);
    const photosCollection = collection(db, "photos");
    const q = query(photosCollection, orderBy("createdAt", "desc"), limit(12)); // Limit to 12 for home page

    const unsubscribePhotos = onSnapshot(q, (querySnapshot) => {
      const photosData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        photosData.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(photosData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching photos from Firestore:", error);
      toast({
        title: "Error Fetching Photos",
        description: "Could not fetch photos. Check browser console for Firestore errors.",
        variant: "destructive",
      });
      setIsLoading(false);
    });

    setIsLoadingHighlights(true);
    const highlightsQuery = query(photosCollection, orderBy("createdAt", "desc"), limit(3));
    const unsubscribeHighlights = onSnapshot(highlightsQuery, (querySnapshot) => {
      const highlightsData: Photo[] = [];
      querySnapshot.forEach((doc) => {
        highlightsData.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setHighlightPhotos(highlightsData);
      setIsLoadingHighlights(false);
    }, (error) => {
      console.error("Error fetching highlight photos:", error);
      toast({
        title: "Error Fetching Highlights",
        description: "Could not fetch highlight photos.",
        variant: "destructive",
      });
      setIsLoadingHighlights(false);
    });
    
    return () => {
      unsubscribePhotos();
      unsubscribeHighlights();
    };
  }, [toast]);

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3, duration: 0.8, ease: "easeOut" }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhotoForModal(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhotoForModal(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60 floating-element"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-accent rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-primary rounded-full animate-bounce opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse opacity-50"></div>
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass sticky top-0 z-50 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-primary p-2 rounded-full blue-glow">
                  <Album className="h-6 w-6 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Amrit's Album
                </h1>
                <p className="text-xs text-muted-foreground">Visual Journey Collection</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('featured-collections-section')} 
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover"
              >
                <Star className="mr-2 h-4 w-4" />
                Featured
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('about-me-section')} 
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                About
              </Button>
              <Link href="/categories">
                <Button 
                  variant="ghost" 
                  className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover"
                >
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Browse
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 smooth-hover">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 blue-glow-hover btn-modern"
                >
                  Admin
                </Button>
              </Link>
            </nav>

            {/* Mobile menu button */}
            <Button variant="ghost" className="md:hidden text-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        id="hero-section"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background with parallax */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 opacity-5"
        >
          <Image
            src={HERO_BACKDROP_IMAGE_URL}
            alt="Hero backdrop"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-accent/10"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 blue-glow">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Undergraduate at IIT Madras | Freelancer | Ads Account Manager | Multi Media | Data Science</span>
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 clean-headline"
          >
            Amrit Kumar Chanchal
          </motion.h1>

          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 max-w-20"></div>
              <Camera className="h-6 w-6 text-primary animate-pulse" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent flex-1 max-w-20"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-muted-foreground mb-6">
              IIT Madras Student | Visual Artist & Digital Marketing Expert
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                Explore a curated collection of authentic moments and compelling stories captured through my lens. 
                From intimate portraits to breathtaking landscapes, each image in this gallery represents my passion 
                for visual storytelling and artistic expression.
              </p>
              <p>
                Browse through my carefully selected works below to experience life's beautiful moments frozen in time. 
                Whether you're seeking inspiration or looking to collaborate, I invite you to immerse yourself in these visual narratives.
              </p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-black font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 blue-glow btn-modern"
              onClick={() => scrollToSection('gallery-main-section')}
            >
              <Eye className="mr-2 h-5 w-5" />
              View Gallery
              <ChevronDown className="ml-2 h-5 w-5 animate-bounce" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-black px-8 py-4 rounded-full transition-all duration-300 blue-glow-hover btn-modern"
              onClick={() => scrollToSection('about-me-section')}
            >
              <UserCircle className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-lg text-primary font-medium italic">
              "Let these images speak their thousand words."
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">{photos.length}+</div>
              <div className="text-sm text-muted-foreground">Photos</div>
            </div>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl font-bold text-accent">30+</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center glass p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Stories</div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute top-1/4 left-10 w-20 h-20 border border-primary/30 rounded-full floating-element hidden lg:block blue-glow"
        ></motion.div>
        <motion.div 
          style={{ y: y1 }}
          className="absolute bottom-1/4 right-10 w-16 h-16 border border-accent/30 rounded-full floating-element hidden lg:block"
        ></motion.div>
      </motion.section>

      {/* Featured Collections */}
      <section id="featured-collections-section" className="py-20 md:py-32 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-accent/30 mb-6 blue-glow">
              <Star className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-sm text-muted-foreground">Featured Collection</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 clean-headline">
              Best Picks from My Gallery
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Showcasing some of my finest photography work shared across the internet. 
              Each image represents a unique moment and artistic vision captured through my lens.
            </p>
          </motion.div>

          {isLoadingHighlights ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl text-muted-foreground">Loading featured work...</p>
              </div>
            </div>
          ) : highlightPhotos.length > 0 ? (
            <WeeklyHighlights photos={highlightPhotos} />
          ) : (
            <div className="text-center py-20">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">New collections coming soon. Stay tuned for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about-me-section" className="py-20 md:py-32 relative scroll-mt-20">
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 blue-glow">
              <UserCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">About the Artist</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 clean-headline">
              My Professional Journey
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl"></div>
              <div className="relative glass rounded-3xl p-8 border border-primary/30 blue-glow card-modern">
                <Image 
                  src={PROFILE_IMAGE_URL} 
                  alt="Amrit Kumar Chanchal - IIT Madras Student & Visual Artist"
                  width={400}
                  height={400}
                  className="rounded-2xl mx-auto object-cover aspect-square shadow-2xl"
                  sizes="(max-width: 768px) 80vw, 400px"
                />
                <div className="absolute -bottom-4 -right-4 bg-primary text-black p-3 rounded-full shadow-lg blue-glow">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Amrit Kumar Chanchal</h3>
                <p className="text-primary font-semibold mb-2">Undergraduate at IIT Madras | Freelancer | Ads Account Manager | Multi Media | Data Science</p>
                <div className="flex items-center gap-2 text-sm text-accent">
                  <GraduationCap className="h-4 w-4" />
                  <span>Indian Institute of Technology, Madras</span>
                </div>
              </div>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I am an undergraduate student at the prestigious Indian Institute of Technology (IIT) Madras, 
                  combining academic excellence with professional experience. As a versatile freelancer and 
                  Ads Account Manager, I help businesses optimize their digital presence and marketing campaigns.
                </p>
                <p>
                  My expertise spans multimedia content creation and data science, where I leverage analytical 
                  skills to drive results. Currently pursuing my degree program, I bring a unique blend of 
                  technical knowledge and practical business acumen to every project.
                </p>
                <p>
                  Through my lens, I explore the intersection of technology and creativity, capturing moments 
                  that tell compelling stories. This album showcases my passion for visual storytelling 
                  alongside my professional journey in the digital landscape.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30 flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  IIT Madras
                </span>
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm border border-accent/30 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Freelancer
                </span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Ads Manager
                </span>
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm border border-accent/30 flex items-center gap-1">
                  <Palette className="h-3 w-3" />
                  Multi Media
                </span>
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30 flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  Data Science
                </span>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => scrollToSection('gallery-main-section')}
                  className="bg-primary hover:bg-primary/90 text-black rounded-full transition-all duration-300 blue-glow btn-modern"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  View Album
                </Button>
                <Link href="/categories">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary text-primary hover:bg-primary hover:text-black rounded-full transition-all duration-300 blue-glow-hover btn-modern"
                  >
                    <Grid3X3 className="mr-2 h-5 w-5" />
                    Browse Collections
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Recent Photos Section */}
      <main id="gallery-main-section" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 mb-6 blue-glow">
              <Images className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Recent Additions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 clean-headline">
              Latest Photos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover my most recent captures and additions to the album. Each photo tells a story 
              and showcases different moments from my ongoing visual journey.
            </p>
            
            <Link href="/categories">
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-black rounded-full transition-all duration-300 blue-glow-hover btn-modern"
              >
                <Grid3X3 className="mr-2 h-5 w-5" />
                Browse All Collections
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
          
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl text-muted-foreground">Loading recent photos...</p>
              </div>
            </div>
          ) : (
            <>
              <PhotoGrid photos={photos} />
              {photos.length >= 12 && (
                <div className="text-center mt-12">
                  <Link href="/categories">
                    <Button 
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-black rounded-full transition-all duration-300 blue-glow btn-modern"
                    >
                      <Grid3X3 className="mr-2 h-5 w-5" />
                      View Complete Album
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-16 border-t border-border/50">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-primary p-2 rounded-full blue-glow">
                  <Album className="h-6 w-6 text-black" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  Amrit's Album
                </h3>
                <p className="text-xs text-muted-foreground">Visual Journey Collection</p>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              A personal collection of life's beautiful moments captured through the lens. 
              Each image tells a story and preserves memories worth cherishing.
            </p>
          </div>
          
          <nav className="flex justify-center items-center gap-6 mb-8 flex-wrap">
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => scrollToSection('hero-section')}>
              Home
            </Button>
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => scrollToSection('featured-collections-section')}>
              Featured
            </Button>
            <Button variant="link" className="text-muted-foreground hover:text-primary p-0" onClick={() => scrollToSection('about-me-section')}>
              About
            </Button>
            <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Collections
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Contact
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Admin
            </Link>
          </nav>
          
          <div className="text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6"></div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Amrit Kumar Chanchal. All rights reserved. Personal Album.
            </p>
          </div>
        </div>
      </footer>

      {/* Photo Modal */}
      {selectedPhotoForModal && (
        <Dialog open={!!selectedPhotoForModal} onOpenChange={(isOpen) => { if (!isOpen) closePhotoModal(); }}>
          <DialogContent className="max-w-4xl w-full p-0 glass border border-primary/30 blue-glow">
            <DialogHeader className="p-6 border-b border-border/50">
              <DialogTitle className="text-2xl font-bold text-primary">
                {selectedPhotoForModal.name}
              </DialogTitle>
              {selectedPhotoForModal.description && (
                <DialogDescription className="text-muted-foreground whitespace-pre-wrap pt-2">
                  {selectedPhotoForModal.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="p-2 bg-muted/20 max-h-[70vh] overflow-y-auto flex justify-center items-center">
              <div className="relative w-full aspect-[4/3] max-w-full max-h-full">
                <Image
                  src={selectedPhotoForModal.src}
                  alt={`${selectedPhotoForModal.name} - Photo by Amrit Kumar Chanchal`}
                  fill
                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 800px"
                  className="object-contain rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-border/50 flex justify-end">
              <Button variant="outline" onClick={closePhotoModal} className="border-primary text-primary hover:bg-primary hover:text-black blue-glow-hover btn-modern">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}