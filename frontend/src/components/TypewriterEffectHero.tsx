"use client";

import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

export default function TypewriterEffectHero() {
  const words = [
    {
      text: "Welcome",
    },
    {
      text: "to",
    },
    {
      text: "Holidays",
       className: "text-amber-500 font-bold",
    },
    {
      text: "by",
       className: "text-amber-500 font-bold",
    },
    {
      text: "Bells",
      className: "text-amber-500 font-bold",
    },
  ];
  
  return (
    <div className="w-full flex items-center justify-center">
      <TypewriterEffectSmooth 
        words={words} 
        className="text-amber-800"
        cursorClassName="bg-amber-500"
      />
    </div>
  );
}
