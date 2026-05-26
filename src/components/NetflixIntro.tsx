import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function NetflixIntro({ onComplete }: { onComplete: () => void }) {
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(false);
      setTimeout(onComplete, 1000);
    }, 4500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          scale: [0.8, 1, 1.2, 5],
        }}
        transition={{ 
          duration: 4,
          times: [0, 0.2, 0.8, 1],
          ease: "easeInOut"
        }}
        className="relative flex flex-col items-center"
      >
        <div className="text-netflix-red font-serif font-bold text-6xl md:text-9xl tracking-tighter netflix-glow">
          OUR STORY
        </div>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="h-1 bg-netflix-red mt-2"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-4 text-love-gold font-sans tracking-[0.5em] text-sm md:text-lg"
        >
          AN ANNIVERSARY ORIGINAL
        </motion.div>
      </motion.div>

      {/* Cinematic Flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ delay: 3.5, duration: 0.5 }}
        className="absolute inset-0 bg-white"
      />
    </div>
  );
}
