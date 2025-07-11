"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Clock, Users } from "lucide-react";
import { TourPackage } from "@/types/tourPackage";
import Link from "next/link";
import Image from "next/image";

interface TourPackage3DCardProps {
  tourPackage: TourPackage;
  onSelect?: (tourPackage: TourPackage) => void;
}

export default function TourPackage3DCard({ 
  tourPackage, 
  onSelect
}: TourPackage3DCardProps) {
  const discount = tourPackage.originalPrice 
    ? Math.round(((tourPackage.originalPrice - tourPackage.price) / tourPackage.originalPrice) * 100)
    : 0;

  // Provide default values for optional fields
  const location = tourPackage.location || "Beautiful Destination";
  const rating = tourPackage.rating || 4.5;
  const reviewCount = tourPackage.reviewCount || 50;
  const groupSize = tourPackage.groupSize || "2-10 people";
  const highlights = tourPackage.highlights || ["Adventure", "Culture", "Nature"];

  // Text trimming functions
  const trimText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength).trim() + '...' : text;
  };

  const trimmedTitle = trimText(tourPackage.title, 50);
  const trimmedDescription = trimText(tourPackage.description, 100);
  const trimmedLocation = trimText(location, 20);

  return (
    <CardContainer className="inter-var py-8">
      <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-gray-950 dark:border-white/[0.2] border-gray-200 w-full max-w-[380px] h-[520px] rounded-xl p-6 border shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        
        {/* Popular Badge */}
        {tourPackage.isPopular && (
          <CardItem
            translateZ="30"
            className="absolute -top-2 -right-2 z-10"
          >
            <Badge className="bg-orange-500 text-white px-3 py-1 text-xs font-semibold">
              Popular
            </Badge>
          </CardItem>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <CardItem
            translateZ="30"
            className="absolute top-2 left-2 z-10"
          >
            <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-bold">
              {discount}% OFF
            </Badge>
          </CardItem>
        )}

        {/* Title */}
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-800 dark:text-white h-[56px] flex items-start"
        >
          {trimmedTitle}
        </CardItem>

        {/* Location and Rating */}
        <CardItem
          translateZ="40"
          className="flex items-center justify-between mt-2"
        >
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm">{trimmedLocation}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
          </div>
        </CardItem>

        {/* Description */}
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-600 text-sm mt-3 dark:text-neutral-300 h-[48px] flex items-start"
        >
          {trimmedDescription}
        </CardItem>

        {/* Image */}
        <CardItem translateZ="100" className="w-full mt-4 flex-shrink-0">
          <div className="relative h-48 w-full overflow-hidden rounded-xl group-hover/card:shadow-xl transition-shadow duration-300">
            <Image
              src={tourPackage.imageUrl}
              alt={tourPackage.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&crop=center';
              }}
            />
          </div>
        </CardItem>

        {/* Tour Details */}
        <CardItem
          translateZ="40"
          className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300"
        >
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{tourPackage.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{groupSize}</span>
          </div>
        </CardItem>

        {/* Highlights */}
        <CardItem
          translateZ="30"
          className="mt-3 flex-grow"
        >
          <div className="flex flex-wrap gap-1 h-[40px] items-start">
            {highlights.slice(0, 3).map((highlight, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
              >
                {trimText(highlight, 12)}
              </Badge>
            ))}
            {highlights.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{highlights.length - 3}
              </Badge>
            )}
          </div>
        </CardItem>

        {/* Price and Actions */}
        <div className="flex justify-between items-center mt-auto pt-4">
          <CardItem translateZ={20} className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-emerald-600">
                ₹{tourPackage.price.toLocaleString()}
              </span>
              {tourPackage.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{tourPackage.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">per person</span>
          </CardItem>

          <div className="flex space-x-2">
            <CardItem
              translateZ={20}
              as={Link}
              href={`/tour-packages/${tourPackage._id}`}
              className="px-3 py-2 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              View Details
            </CardItem>
            <CardItem
              translateZ={20}
              as={Button}
              onClick={() => onSelect?.(tourPackage)}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              Book Now
            </CardItem>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}
