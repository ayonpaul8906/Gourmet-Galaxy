"use client";

import React from "react";
import Image from "next/image";

interface RestaurantCardProps {
  name: string;
  location?: string;
  imageUrl?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  name,
  location,
  imageUrl,
  onClick,
  isSelected,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
        isSelected ? "ring-4 ring-orange-500" : ""
      }`}
    >
      <div className="relative h-58 w-full">
        <Image
          src={imageUrl || "https://placehold.co/600x400?text=Restaurant"}
          alt={name}
          fill
          className=" brightness-90 h-48 w-full"
        />
      </div>
      <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-all"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="text-lg font-semibold">{name}</h3>
        {location && <p className="text-sm opacity-90">{location}</p>}
      </div>
    </div>
  );
};

export default RestaurantCard;
