import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';

interface PhotoItem {
  src: string;
  caption: string;
}

const capturedMoments: PhotoItem[] = [
  {
    src: new URL('../images/DDS_7938 copy.jpg.jpeg', import.meta.url).href,
    caption: "Together on the road"
  },
  {
    src: new URL('../images/DDS_8098 copy.jpg.jpeg', import.meta.url).href,
    caption: "Adventure together"
  },
  {
    src: new URL('../images/IMG-20250622-WA0015.jpg.jpeg', import.meta.url).href,
    caption: "Mirror selfie vibes"
  },
  {
    src: new URL('../images/IMG-20250625-WA0008.jpg.jpeg', import.meta.url).href,
    caption: "Pencil sketch of us"
  },
  {
    src: new URL('../images/IMG-20250625-WA0014.jpg.jpeg', import.meta.url).href,
    caption: "Face mask night — couples edition"
  },
  {
    src: new URL('../images/IMG-20250714-WA0022.jpg.jpeg', import.meta.url).href,
    caption: "Wedding celebrations with family"
  },
  {
    src: new URL('../images/IMG_0830.JPG.jpeg', import.meta.url).href,
    caption: "Temple selfie — traditional outfit"
  },
  {
    src: new URL('../images/IMG_0850.JPG.jpeg', import.meta.url).href,
    caption: "Her jasmine kiss"
  },
  {
    src: new URL('../images/Snapchat-80510333.jpg.jpeg', import.meta.url).href,
    caption: "When her husband sleeps on her chest"
  },
  {
    src: new URL('../images/IMG_1677.JPG.jpeg', import.meta.url).href,
    caption: "Hand made Vinayagar on Chaturthy as Couple"
  },
  {
    src: new URL('../images/IMG_20250704_181445_096.jpg.jpeg', import.meta.url).href,
    caption: "Mirror kiss"
  },
  {
    src: new URL('../images/IMG_20251017_211407_279.webp', import.meta.url).href,
    caption: "Nose to nose"
  },
  {
    src: new URL('../images/IMG_1964.JPG.jpeg', import.meta.url).href,
    caption: "Stylish couple"
  },
  {
    src: new URL('../images/Snapchat-1182939537.jpg.jpeg', import.meta.url).href,
    caption: "Capture the moment"
  },
  {
    src: new URL('../images/IMG-20260110-WA0000.jpg.jpeg', import.meta.url).href,
    caption: "Childhood pic"
  },
];

const beautifulMemories: PhotoItem[] = [
  {
    src: new URL('../images/IMG-20260101-WA0029.jpg.jpeg', import.meta.url).href,
    caption: "Bike ride in the forest"
  },
  {
    src: new URL('../images/IMG-20260116-WA0006.jpg.jpeg', import.meta.url).href,
    caption: "Red outfit — balcony romance"
  },
  {
    src: new URL('../images/IMG-20260116-WA0015.jpg.jpeg', import.meta.url).href,
    caption: "Lost in each other's eyes"
  },
  {
    src: new URL('../images/IMG-20260201-WA0107.jpg.jpeg', import.meta.url).href,
    caption: "Rooftop love"
  },
  {
    src: new URL('../images/IMG-20260314-WA0000.jpg.jpeg', import.meta.url).href,
    caption: "Temple visit together"
  },
  {
    src: new URL('../images/IMG_2154.JPG.jpeg', import.meta.url).href,
    caption: "Surprise kiss in the woods"
  },
  {
    src: new URL('../images/Screenshot_20260111-151411~2.png', import.meta.url).href,
    caption: "Early days selfie"
  },
  {
    src: new URL('../images/Snapchat-207435020.jpg.jpeg', import.meta.url).href,
    caption: "Cutie with bows"
  },
  {
    src: new URL('../images/Snapchat-1145321976~2.jpg.jpeg', import.meta.url).href,
    caption: "Puppy love"
  },
  {
    src: new URL('../images/PXL_20251101_043234439.jpg.jpeg', import.meta.url).href,
    caption: "First same brush after marriage"
  },
];

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  const GallerySection = ({ title, subtitle, id, photos }: { title: string, subtitle: string, id: string, photos: PhotoItem[] }) => (
    <div id={id} className="py-20 first:pt-32 last:pb-32">
      <div className="mb-20 text-center">
        <h2 className="text-5xl font-serif mb-4 italic">{title}</h2>
        <p className="text-gray-500 font-sans tracking-widest uppercase text-sm">{subtitle}</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.1 }}
            className="relative group cursor-pointer rounded-sm overflow-hidden break-inside-avoid"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.src} alt={photo.caption} className="w-full transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end pb-6 px-4">
              <Maximize2 className="text-white absolute top-4 right-4" size={24} />
              <p className="text-white text-sm font-sans tracking-wide text-center">{photo.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4">
        <GallerySection 
          id="captured-moments" 
          title="Captured Moments" 
          subtitle="Episodes of Our Life" 
          photos={capturedMoments} 
        />
        
        <GallerySection 
          id="journey" 
          title="Beautiful Memories" 
          subtitle="Side by Side, Day by Day" 
          photos={beautifulMemories} 
        />
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 md:p-20"
            onClick={() => setSelectedPhoto(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white hover:text-love-red transition-colors"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={40} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={selectedPhoto.src} 
              alt={selectedPhoto.caption}
              className="max-w-full max-h-[80vh] object-contain shadow-2xl"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 font-sans tracking-wide text-lg mt-6 italic"
            >
              {selectedPhoto.caption}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
