"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Photo } from "@/types";
import { CategoryIcon } from "./icons/category-icon";
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Camera, 
  Aperture, 
  Zap, 
  Image as ImageIcon,
  FileText,
  Hash,
  Heart,
  Eye,
  Share2,
  MessageCircle,
  Download,
  Info,
  Settings,
  BarChart3,
  Copy,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoDetailModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock function to generate realistic metadata
function generatePhotoMetadata(photo: Photo) {
  const cameras = ["Canon EOS R5", "Nikon D850", "Sony A7R IV", "Fujifilm X-T4"];
  const lenses = ["24-70mm f/2.8", "85mm f/1.4", "16-35mm f/2.8", "50mm f/1.8"];
  const isoValues = [100, 200, 400, 800, 1600];
  const apertures = ["f/1.4", "f/2.8", "f/4.0", "f/5.6", "f/8.0"];
  const shutterSpeeds = ["1/60", "1/125", "1/250", "1/500", "1/1000"];
  
  return {
    camera: cameras[Math.floor(Math.random() * cameras.length)],
    lens: lenses[Math.floor(Math.random() * lenses.length)],
    iso: isoValues[Math.floor(Math.random() * isoValues.length)],
    aperture: apertures[Math.floor(Math.random() * apertures.length)],
    shutterSpeed: shutterSpeeds[Math.floor(Math.random() * shutterSpeeds.length)],
    focalLength: `${Math.floor(Math.random() * 100) + 24}mm`,
    fileSize: `${(Math.random() * 10 + 5).toFixed(1)} MB`,
    dimensions: `${Math.floor(Math.random() * 2000) + 3000} × ${Math.floor(Math.random() * 1500) + 2000}`,
    colorSpace: "sRGB",
    format: "JPEG",
    compression: "High Quality",
    bitDepth: "8-bit"
  };
}

// Mock function to generate engagement metrics
function generateEngagementMetrics() {
  return {
    views: Math.floor(Math.random() * 10000) + 500,
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 50) + 5,
    shares: Math.floor(Math.random() * 100) + 10,
    downloads: Math.floor(Math.random() * 200) + 20,
    impressions: Math.floor(Math.random() * 50000) + 5000
  };
}

export function PhotoDetailModal({ photo, isOpen, onClose }: PhotoDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  if (!photo) return null;

  const metadata = generatePhotoMetadata(photo);
  const engagement = generateEngagementMetrics();

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} copied successfully`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | any) => {
    if (!date) return "Unknown";
    const photoDate = date.toDate ? date.toDate() : new Date(date);
    return photoDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {copiedField === fieldName ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 glass border border-primary/30 blue-glow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Image Display */}
          <div className="relative bg-black/50 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-h-[80vh]">
              <Image
                src={photo.src}
                alt={`${photo.name} - Photo by Amrit Kumar Chanchal`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain rounded-lg"
                priority
              />
            </div>
            
            {/* Image overlay controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-black/50 border-white/20 text-white hover:bg-black/70 backdrop-blur-sm"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Information Panel */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 border-b border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-primary mb-2">
                    {photo.name}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CategoryIcon category={photo.category} className="h-4 w-4 text-primary" />
                      <span>{photo.category}</span>
                    </div>
                    {photo.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{photo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="details" className="h-full">
                <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="technical" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Technical
                  </TabsTrigger>
                  <TabsTrigger value="engagement" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="metadata" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Metadata
                  </TabsTrigger>
                </TabsList>

                <div className="p-4 pt-2">
                  <TabsContent value="details" className="space-y-6 mt-4">
                    {/* Basic Information */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ImageIcon className="h-5 w-5 text-primary" />
                          Photo Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {photo.description && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <p className="text-sm mt-1 leading-relaxed">{photo.description}</p>
                          </div>
                        )}
                        
                        {photo.caption && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Caption</label>
                            <p className="text-sm mt-1">{photo.caption}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Date Taken</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                {formatDate(photo.createdAt)}
                              </p>
                              <CopyButton text={formatDate(photo.createdAt)} fieldName="Date" />
                            </div>
                          </div>

                          {photo.postingDate && (
                            <div className="group">
                              <label className="text-sm font-medium text-muted-foreground">Posted</label>
                              <div className="flex items-center justify-between">
                                <p className="text-sm mt-1 flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {formatDate(photo.postingDate)}
                                </p>
                                <CopyButton text={formatDate(photo.postingDate)} fieldName="Posted Date" />
                              </div>
                            </div>
                          )}
                        </div>

                        {photo.altText && (
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Alt Text</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1">{photo.altText}</p>
                              <CopyButton text={photo.altText} fieldName="Alt Text" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Tags */}
                    {photo.tags && photo.tags.length > 0 && (
                      <Card className="glass border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Hash className="h-5 w-5 text-primary" />
                            Tags & Keywords
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {photo.tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                                onClick={() => copyToClipboard(`#${tag}`, `Tag: ${tag}`)}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-6 mt-4">
                    {/* Camera Settings */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Camera className="h-5 w-5 text-primary" />
                          Camera Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Camera</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.camera}</p>
                              <CopyButton text={metadata.camera} fieldName="Camera" />
                            </div>
                          </div>
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Lens</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.lens}</p>
                              <CopyButton text={metadata.lens} fieldName="Lens" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">ISO</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono flex items-center gap-2">
                                <Zap className="h-4 w-4 text-accent" />
                                {metadata.iso}
                              </p>
                              <CopyButton text={metadata.iso.toString()} fieldName="ISO" />
                            </div>
                          </div>
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Aperture</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono flex items-center gap-2">
                                <Aperture className="h-4 w-4 text-accent" />
                                {metadata.aperture}
                              </p>
                              <CopyButton text={metadata.aperture} fieldName="Aperture" />
                            </div>
                          </div>
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Shutter</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.shutterSpeed}</p>
                              <CopyButton text={metadata.shutterSpeed} fieldName="Shutter Speed" />
                            </div>
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-muted-foreground">Focal Length</label>
                          <div className="flex items-center justify-between">
                            <p className="text-sm mt-1 font-mono">{metadata.focalLength}</p>
                            <CopyButton text={metadata.focalLength} fieldName="Focal Length" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* File Information */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-primary" />
                          File Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">File Size</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.fileSize}</p>
                              <CopyButton text={metadata.fileSize} fieldName="File Size" />
                            </div>
                          </div>
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Format</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.format}</p>
                              <CopyButton text={metadata.format} fieldName="Format" />
                            </div>
                          </div>
                        </div>

                        <div className="group">
                          <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                          <div className="flex items-center justify-between">
                            <p className="text-sm mt-1 font-mono">{metadata.dimensions}</p>
                            <CopyButton text={metadata.dimensions} fieldName="Dimensions" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Color Space</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.colorSpace}</p>
                              <CopyButton text={metadata.colorSpace} fieldName="Color Space" />
                            </div>
                          </div>
                          <div className="group">
                            <label className="text-sm font-medium text-muted-foreground">Bit Depth</label>
                            <div className="flex items-center justify-between">
                              <p className="text-sm mt-1 font-mono">{metadata.bitDepth}</p>
                              <CopyButton text={metadata.bitDepth} fieldName="Bit Depth" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="engagement" className="space-y-6 mt-4">
                    {/* Engagement Metrics */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Engagement Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 glass rounded-lg border border-primary/20">
                            <Eye className="h-6 w-6 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-primary">{engagement.views.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Views</p>
                          </div>
                          <div className="text-center p-4 glass rounded-lg border border-accent/20">
                            <Heart className="h-6 w-6 text-accent mx-auto mb-2" />
                            <p className="text-2xl font-bold text-accent">{engagement.likes.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Likes</p>
                          </div>
                          <div className="text-center p-4 glass rounded-lg border border-primary/20">
                            <MessageCircle className="h-6 w-6 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-primary">{engagement.comments.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Comments</p>
                          </div>
                          <div className="text-center p-4 glass rounded-lg border border-accent/20">
                            <Share2 className="h-6 w-6 text-accent mx-auto mb-2" />
                            <p className="text-2xl font-bold text-accent">{engagement.shares.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Shares</p>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Impressions</span>
                            <span className="font-mono text-sm">{engagement.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Downloads</span>
                            <span className="font-mono text-sm">{engagement.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Engagement Rate</span>
                            <span className="font-mono text-sm">{((engagement.likes + engagement.comments + engagement.shares) / engagement.views * 100).toFixed(2)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="metadata" className="space-y-6 mt-4">
                    {/* Raw Metadata */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-5 w-5 text-primary" />
                          Complete Metadata
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm font-mono">
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Photo ID:</span>
                            <div className="flex items-center gap-2">
                              <span>{photo.id}</span>
                              <CopyButton text={photo.id} fieldName="Photo ID" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">File URL:</span>
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-48">{photo.src}</span>
                              <CopyButton text={photo.src} fieldName="File URL" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Created:</span>
                            <div className="flex items-center gap-2">
                              <span>{formatDate(photo.createdAt)}</span>
                              <CopyButton text={formatDate(photo.createdAt)} fieldName="Created Date" />
                            </div>
                          </div>
                          {photo.updatedAt && (
                            <div className="flex justify-between items-center group">
                              <span className="text-muted-foreground">Updated:</span>
                              <div className="flex items-center gap-2">
                                <span>{formatDate(photo.updatedAt)}</span>
                                <CopyButton text={formatDate(photo.updatedAt)} fieldName="Updated Date" />
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Category:</span>
                            <div className="flex items-center gap-2">
                              <span>{photo.category}</span>
                              <CopyButton text={photo.category} fieldName="Category" />
                            </div>
                          </div>
                          {photo.location && (
                            <div className="flex justify-between items-center group">
                              <span className="text-muted-foreground">Location:</span>
                              <div className="flex items-center gap-2">
                                <span>{photo.location}</span>
                                <CopyButton text={photo.location} fieldName="Location" />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Specifications */}
                    <Card className="glass border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-lg">Technical Specifications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm font-mono">
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Camera Model:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.camera}</span>
                              <CopyButton text={metadata.camera} fieldName="Camera Model" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Lens:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.lens}</span>
                              <CopyButton text={metadata.lens} fieldName="Lens" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">ISO Speed:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.iso}</span>
                              <CopyButton text={metadata.iso.toString()} fieldName="ISO Speed" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Aperture:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.aperture}</span>
                              <CopyButton text={metadata.aperture} fieldName="Aperture" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Shutter Speed:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.shutterSpeed}</span>
                              <CopyButton text={metadata.shutterSpeed} fieldName="Shutter Speed" />
                            </div>
                          </div>
                          <div className="flex justify-between items-center group">
                            <span className="text-muted-foreground">Focal Length:</span>
                            <div className="flex items-center gap-2">
                              <span>{metadata.focalLength}</span>
                              <CopyButton text={metadata.focalLength} fieldName="Focal Length" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}