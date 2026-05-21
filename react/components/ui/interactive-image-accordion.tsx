'use client';

import React, { useState } from 'react';

const accordionItems = [
  {
    id: 1,
    title: 'Weby',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Propagačné materiály',
    imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Logo dizajn',
    imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Vizuálna identita',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2090&auto=format&fit=crop',
  },
];

interface AccordionItemProps {
  item: (typeof accordionItems)[number];
  isActive: boolean;
  onMouseEnter: () => void;
}

const AccordionItem = ({ item, isActive, onMouseEnter }: AccordionItemProps) => {
  return (
    <div
      className={`
        relative h-[450px] rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-in-out flex-shrink-0
        ${isActive ? 'w-[400px]' : 'w-[60px]'}
      `}
      onMouseEnter={onMouseEnter}
    >
      <img
        src={item.imageUrl}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://placehold.co/400x450/111/ffffff?text=Arteo';
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      <span
        className={`
          absolute text-white text-lg font-semibold whitespace-nowrap
          transition-all duration-300 ease-in-out
          ${
            isActive
              ? 'bottom-6 left-1/2 -translate-x-1/2 rotate-0'
              : 'bottom-24 left-1/2 -translate-x-1/2 rotate-90'
          }
        `}
      >
        {item.title}
      </span>
    </div>
  );
};

export function LandingAccordionItem() {
  const [activeIndex, setActiveIndex] = useState(accordionItems.length - 1);

  return (
    <div className="font-sans">
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left: text */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Arteo Studio
            </p>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight tracking-tighter">
              Naše projekty
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
              Tvoríme značky, weby a vizuálne identity pre ambicióznych podnikateľov. Každý projekt je jedinečný.
            </p>
          </div>

          {/* Right: accordion */}
          <div className="w-full md:w-1/2">
            <div className="flex flex-row items-center justify-center gap-3 overflow-x-auto p-4">
              {accordionItems.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
