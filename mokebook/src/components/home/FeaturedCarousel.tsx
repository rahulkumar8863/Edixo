
"use client";

import * as React from "react";
import Image from "next/image";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight, Star } from "lucide-react";

export function FeaturedCarousel() {
  const hero = PlaceHolderImages.find(img => img.id === "hero-exam");

  const slides = [
    {
      title: "JEE Main 2024 Full Mock Pack",
      description: "Experience the real exam with our latest NTA patterns tests.",
      category: "JEE MAINS",
      tag: "FEATURED",
      enrolled: "50,000+",
      rating: "4.9/5",
      color: "from-blue-600/90 to-blue-900/90"
    },
    {
      title: "SSC CGL Tier-II Mega Pack",
      description: "Master quantitative aptitude with 500+ chapter tests.",
      category: "SSC CGL",
      tag: "TRENDING",
      enrolled: "32,000+",
      rating: "4.8/5",
      color: "from-orange-600/90 to-orange-900/90"
    }
  ];

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {slides.map((slide, index) => (
          <CarouselItem key={index}>
            <div className="relative h-[280px] w-full overflow-hidden rounded-2xl shadow-xl">
              <Image
                src={hero?.imageUrl || `https://picsum.photos/seed/${index}/1200/400`}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} flex flex-col justify-center p-6 md:p-10 text-white`}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold">
                    {slide.category}
                  </Badge>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-[9px] font-bold">
                    <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                    {slide.rating}
                  </div>
                </div>

                <div className="max-w-xl space-y-2">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed max-w-lg">
                    {slide.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 h-10 rounded-xl text-xs shadow-lg group">
                    Start Test Now
                    <ArrowRight className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs leading-none">{slide.enrolled}</span>
                    <span className="text-[8px] uppercase font-bold tracking-wider opacity-60">Students</span>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="hidden md:block">
        <CarouselPrevious className="left-4 h-8 w-8 bg-white/10 border-white/20 text-white" />
        <CarouselNext className="right-4 h-8 w-8 bg-white/10 border-white/20 text-white" />
      </div>
    </Carousel>
  );
}
