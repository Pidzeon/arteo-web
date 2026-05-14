'use client';

import { RadialScrollGallery } from '@/components/ui/portfolio-and-image-gallery';

const projects = [
  {
    title: 'TOMAX Pneuservis',
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
      {/* Header */}
      <div className="flex items-center justify-center px-8 pt-24 pb-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Arteo Studio
          </p>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Vybrané projekty
          </h1>
          <p className="text-sm text-muted-foreground pt-1">
            Scrollujte nadol a objavte naše práce.
          </p>
        </div>
      </div>

      <RadialScrollGallery
        baseRadius={400}
        mobileRadius={210}
        scrollDuration={2000}
        visiblePercentage={42}
        startTrigger="center center"
      >
        {(hoveredIndex) =>
          projects.map((project, index) => {
            const isActive = hoveredIndex === index;
            return (
              <div
                key={index}
                className="relative w-[160px] h-[220px] sm:w-[190px] sm:h-[260px] rounded-2xl overflow-hidden shadow-md"
              >
                {/* Primary image */}
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isActive ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {/* Secondary image on hover */}
                <img
                  src={project.images[1]}
                  alt={project.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                {/* Title overlay */}
                <div
                  className={`absolute inset-0 flex items-end p-4 transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
                      : 'bg-gradient-to-t from-black/50 via-transparent to-transparent'
                  }`}
                >
                  <p
                    className={`text-white font-bold leading-tight transition-all duration-500 ${
                      isActive ? 'text-sm opacity-100' : 'text-xs opacity-70'
                    }`}
                  >
                    {project.title}
                  </p>
                </div>
              </div>
            );
          })
        }
      </RadialScrollGallery>

      {/* Footer spacer */}
      <div className="h-32" />
    </main>
  );
}
