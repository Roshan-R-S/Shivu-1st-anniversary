/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import NetflixIntro from './components/NetflixIntro';
import MouseTrail from './components/MouseTrail';
import MusicPlayer from './components/MusicPlayer';
import GalaxyBackground from './components/GalaxyBackground';
import Timeline from './components/Timeline';
import LoveLetter from './components/LoveLetter';
import Gallery from './components/Gallery';
import VideoGallery from './components/VideoGallery';
import { ChevronDown, Heart } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="relative min-h-screen text-gray-100 selection:bg-love-red">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <NetflixIntro key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <GalaxyBackground />
            <MouseTrail />
            <MusicPlayer />

            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
              </div>
              
              <div className="relative z-20 text-center px-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1.2 }}
                >
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="flex justify-center mb-8"
                  >
                    <Heart size={48} className="text-love-red fill-current netflix-glow" />
                  </motion.div>
                  
                  <span className="text-love-gold font-sans tracking-[0.5em] text-xs md:text-sm uppercase mb-4 block animate-pulse">
                    May 28, 2026 • Written in the Stars
                  </span>
                  <h1 className="text-5xl md:text-9xl font-serif mb-6 italic tracking-tight">
                    Prabhu & Shivani
                  </h1>
                  <p className="text-xl md:text-3xl font-serif text-gray-300 italic opacity-80 max-w-2xl mx-auto leading-relaxed">
                    "A journey through space and time, starting with just one year of forever."
                  </p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20"
              >
                <div className="text-[10px] uppercase tracking-widest text-gray-500">Scroll Story</div>
                <ChevronDown className="animate-bounce text-love-gold" size={32} />
              </motion.div>
            </header>

            {/* Story Sections */}
            <Timeline />
            
            <Gallery />
            <VideoGallery />

            <section className="bg-transparent py-20 flex justify-center overflow-hidden relative">
               <motion.div 
                style={{ rotate: 45 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="opacity-5 absolute"
               >
                  <Heart size={400} className="text-love-red fill-current" />
               </motion.div>
               <div className="relative z-10 text-center px-4">
                  <h2 className="text-4xl md:text-6xl font-serif italic mb-8">From the Heart</h2>
               </div>
            </section>

            <LoveLetter />

            {/* Ending Section */}
            <footer className="py-40 bg-transparent text-center relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="max-w-4xl mx-auto px-4"
              >
                <Heart className="mx-auto text-love-red mb-8" size={64} />
                <h2 className="text-5xl md:text-7xl font-serif mb-6 italic">To many more years together</h2>
                <p className="text-love-gold font-sans tracking-widest uppercase mb-12">I love you, forever and always.</p>
                
                <div className="flex justify-center items-center gap-8 mt-20 opacity-90">
                   <Heart size={24} className="text-love-gold fill-current animate-pulse duration-1000" />
                   <Heart size={32} className="text-netflix-red fill-current animate-pulse duration-700 drop-shadow-[0_0_15px_rgba(229,9,20,0.8)]" />
                   <Heart size={24} className="text-love-gold fill-current animate-pulse duration-1000" />
                </div>
              </motion.div>
              
              {/* Floating backgrounds */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [-20, -120], 
                      opacity: [0, 1, 0],
                      x: [Math.random() * 20, Math.random() * -20]
                    }}
                    transition={{ 
                      duration: 4 + Math.random() * 4,
                      repeat: Infinity,
                      delay: Math.random() * 5
                    }}
                    style={{ 
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      bottom: '-20px'
                    }}
                  >
                    <Heart size={20 + Math.random() * 20} className="text-love-red" />
                  </motion.div>
                ))}
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
