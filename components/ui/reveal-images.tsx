import { cn } from "@/lib/utils";

interface ImageSource {
  src: string;
  alt: string;
}

interface ShowImageListItemProps {
  text: string;
  images: [ImageSource, ImageSource];
}

function RevealImageListItem({ text, images }: ShowImageListItemProps) {
  const container = "absolute right-8 -top-1 z-40 h-20 w-16";
  const effect =
    "relative duration-500 delay-100 shadow-none group-hover:shadow-xl scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 group-hover:w-full group-hover:h-full w-16 h-16 overflow-hidden transition-all rounded-md";

  return (
    <div className="group relative h-fit w-fit overflow-visible py-8">
      <h1 className="text-7xl font-black text-foreground transition-all duration-500 group-hover:opacity-40">
        {text}
      </h1>
      <div className={container}>
        <div className={effect}>
          <img alt={images[1].alt} src={images[1].src} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className={cn(
          container,
          "translate-x-0 translate-y-0 rotate-0 transition-all delay-150 duration-500 group-hover:translate-x-6 group-hover:translate-y-6 group-hover:rotate-12",
        )}
      >
        <div className={cn(effect, "duration-200")}>
          <img alt={images[0].alt} src={images[0].src} className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  );
}

function RevealImageList() {
  const items: ShowImageListItemProps[] = [
    {
      text: "TOMAX Pneuservis",
      images: [
        {
          src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&auto=format&fit=crop&q=60",
          alt: "Pneuservis web design",
        },
        {
          src: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&auto=format&fit=crop&q=60",
          alt: "Motorsport detail",
        },
      ],
    },
    {
      text: "Propagačné materiály",
      images: [
        {
          src: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&auto=format&fit=crop&q=60",
          alt: "Print materiály",
        },
        {
          src: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop&q=60",
          alt: "Propagačný leták",
        },
      ],
    },
    {
      text: "Logo dizajn",
      images: [
        {
          src: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&auto=format&fit=crop&q=60",
          alt: "Logo dizajn",
        },
        {
          src: "https://images.unsplash.com/photo-1634942536790-4489af3ba2c3?w=200&auto=format&fit=crop&q=60",
          alt: "Brand identity",
        },
      ],
    },
    {
      text: "Vizuálna identita",
      images: [
        {
          src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&auto=format&fit=crop&q=60",
          alt: "Vizuálna identita",
        },
        {
          src: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&auto=format&fit=crop&q=60",
          alt: "Brand manuál",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-1 rounded-sm bg-background px-8 py-4">
      <h3 className="text-sm font-black uppercase text-muted-foreground">Vybrané projekty</h3>
      {items.map((item, index) => (
        <RevealImageListItem key={index} text={item.text} images={item.images} />
      ))}
    </div>
  );
}

export { RevealImageList };
