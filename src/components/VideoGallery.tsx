import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X } from 'lucide-react';

interface VideoItem {
  title: string;
  date?: string;
  description: string;
  url: string;
  rotate?: 'left' | 'right' | '180';
}

const videos: VideoItem[] = [
  {
    title: "First Outing after Marriage",
    date: "June 21, 2025",
    description: "The moment our hearts aligned.",
    url: new URL('../videos/VID_20250621_031903_541.mp4', import.meta.url).href
  },
  {
    title: "Golden Hour Whispers",
    date: "July 14, 2025",
    description: "Chasing sunsets and beautiful smiles.",
    url: new URL('../videos/Untitled design.mp4', import.meta.url).href
  },
  {
    title: "Summer Sunshine",
    description: "Laughing under the warm July sun.",
    url: new URL('../videos/VID-20250714-WA0077.mp4', import.meta.url).href
  },
  {
    title: "Late Night Drives",
    date: "November 20, 2025",
    description: "Singing along to our favorite songs.",
    url: new URL('../videos/VID_20251120_051128_276.mp4', import.meta.url).href
  },
  {
    title: "Cozy Autumn Nights",
    date: "November 20, 2025",
    description: "Warm coffee, cold air, and your hand in mine.",
    url: new URL('../videos/VID_20251120_051140_257.mp4', import.meta.url).href
  },
  {
    title: "Winter Wonders",
    date: "December 4, 2025",
    description: "Wrapping up the year with the best gift of all.",
    url: new URL('../videos/VID-20251204-WA0001~2.mp4', import.meta.url).href
  }
];

function VideoCard({ video, index, onClick }: { video: VideoItem; index: number; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = async () => {
    setIsHovered(true);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = 0;
        await videoRef.current.play();
      } catch (error) {
        // Autoplay could be blocked by browser policies in some contexts, safe fallback
        console.warn("Autoplay preview blocked:", error);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Get rotation and scaling classes for the card preview
  const getVideoClasses = () => {
    const base = "w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700";
    if (video.rotate === 'left') {
      return `${base} rotate-[-90deg] scale-[1.78]`;
    }
    if (video.rotate === 'right') {
      return `${base} rotate-[90deg] scale-[1.78]`;
    }
    if (video.rotate === '180') {
      return `${base} rotate-[180deg] scale-105 group-hover:scale-100`;
    }
    return `${base} scale-105 group-hover:scale-100`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative aspect-video group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg hover:shadow-love-red/20 transition-all duration-500"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Preview */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.url}
          muted
          playsInline
          preload="metadata"
          className={getVideoClasses()}
        />
      </div>

      {/* Cinematic Film Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/70 group-hover:via-black/10 transition-all duration-500 flex flex-col justify-between p-6 z-10">
        {/* Top bar details */}
        <div className="flex justify-between items-start">
          {video.date ? (
            <span className="text-[10px] uppercase tracking-[0.2em] text-love-gold font-sans font-medium px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full border border-love-gold/20">
              {video.date}
            </span>
          ) : <div />}
          <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-black/40 backdrop-blur-sm group-hover:scale-110 group-hover:border-love-red transition-all duration-300">
            <Play className="text-white group-hover:text-love-red fill-current ml-0.5 transition-colors" size={12} />
          </div>
        </div>

        {/* Bottom bar details */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-xl md:text-2xl font-serif italic text-white mb-1 drop-shadow-md">
            {video.title}
          </h3>
          <p className="text-xs text-gray-400 font-sans opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-1">
            {video.description}
          </p>
        </div>
      </div>
      
      {/* Cinematic Filmstrip Border Styling */}
      <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2 opacity-30 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-xs" />
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2 opacity-30 pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-xs" />
        ))}
      </div>
    </motion.div>
  );
}

export default function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const isRotated = selectedVideo?.rotate === 'left' || selectedVideo?.rotate === 'right';

  return (
    <section id="videos" className="py-32 bg-transparent relative z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-20 text-center">
          <h2 className="text-5xl font-serif mb-4 italic">Cinematic Memories</h2>
          <p className="text-gray-500 font-sans tracking-widest uppercase text-sm">Our Story in Motion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {videos.map((video, i) => (
            <VideoCard
              key={i}
              video={video}
              index={i}
              onClick={() => setSelectedVideo(video)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-6 text-white hover:text-love-gold transition-colors z-[110]"
              onClick={() => setSelectedVideo(null)}
            >
              <X size={40} strokeWidth={1} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center ${
                isRotated
                  ? 'max-w-[min(450px,90vw)] aspect-[9/16]'
                  : 'max-w-6xl aspect-video'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {selectedVideo.rotate === 'left' ? (
                <video 
                  controls 
                  autoPlay 
                  className="absolute w-[177.77%] h-[56.25%] top-[21.875%] left-[-38.88%] rotate-[-90deg] object-cover"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : selectedVideo.rotate === 'right' ? (
                <video 
                  controls 
                  autoPlay 
                  className="absolute w-[177.77%] h-[56.25%] top-[21.875%] left-[-38.88%] rotate-[90deg] object-cover"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full"
                  src={selectedVideo.url}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
