'use client';

import { Hero } from '@/components/ui/hero';
import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';

const projects = [
  {
    title: 'Weby',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Propagačné materiály',
    images: [
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Logo dizajn',
    images: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1634942536790-4489af3ba2c3?w=400&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Vizuálna identita',
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&auto=format&fit=crop&q=60',
    ],
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Hero
        title="Pretože dobré nie je dosť dobré."
        subtitle="Grafický dizajn a weby pre malých a stredných podnikateľov. Nitra → kdekoľvek."
        actions={[
          { label: 'Pozri prácu', href: '#projekty', variant: 'outline' },
          { label: 'Napíš nám', href: '#kontakt', variant: 'default' },
        ]}
        titleClassName="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
        subtitleClassName="text-lg md:text-xl max-w-[560px]"
        actionsClassName="mt-6"
      />

      <section id="projekty" className="py-24">
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Arteo Studio
          </p>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Naše projekty
          </h2>
        </div>

        <RadialScrollGallery
          baseRadius={400}
          mobileRadius={210}
          scrollDuration={2000}
          visiblePercentage={42}
        >
          {(hoveredIndex) =>
            projects.map((project, index) => {
              const isActive = hoveredIndex === index;
              return (
                <div
                  key={index}
                  className="relative w-[160px] h-[220px] sm:w-[190px] sm:h-[260px] rounded-2xl overflow-hidden shadow-md"
                >
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-100'}`}
                  />
                  <img
                    src={project.images[1]}
                    alt={project.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <div className={`absolute inset-0 flex items-end p-4 transition-all duration-500 ${isActive ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent' : 'bg-gradient-to-t from-black/50 via-transparent to-transparent'}`}>
                    <p className={`text-white font-bold leading-tight transition-all duration-500 ${isActive ? 'text-sm opacity-100' : 'text-xs opacity-70'}`}>
                      {project.title}
                    </p>
                  </div>
                </div>
              );
            })
          }
        </RadialScrollGallery>
      </section>

      <div className="h-32" />
    </main>
  );
}
