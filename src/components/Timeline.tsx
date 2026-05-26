import { motion } from 'motion/react';
import { Sparkles, Lock, Heart, Gem, Pen } from 'lucide-react';

const timelineEvents = [
  {
    date: "August 6, 2017",
    title: "Love at First Sight",
    icon: <Sparkles className="text-love-gold" size={24} />,
    description: "The moment that changed everything. One look was all it took.",
    image: new URL('../images/IMG-20250709-WA0026~2.jpg.jpeg', import.meta.url).href,
  },
  {
    date: "April 15, 2021",
    title: "Secret Meetings",
    icon: <Lock className="text-love-gold" size={24} />,
    description: "Stolen moments, hidden smiles. Every secret meeting made our hearts grow stronger.",
    image: new URL('../images/IMG-20250709-WA0028.jpg.jpeg', import.meta.url).href,
  },
  {
    date: "June 5, 2024",
    title: "Secret Rendezvous",
    icon: <Heart className="text-love-red" size={24} />,
    description: "Another chapter of stolen moments, proving love always finds a way.",
    image: new URL('../images/IMG-20250709-WA0029.jpg.jpeg', import.meta.url).href,
  },
  {
    date: "November 20, 2025",
    title: "Our Special Day",
    icon: <Gem className="text-love-gold" size={24} />,
    description: "The most beautiful celebration of our love. Two hearts, one soul, forever bound.",
    image: new URL('../images/IMG_20251120_183939_528.jpg.jpeg', import.meta.url).href,
  },
  {
    date: "August 6, 2025",
    title: "First Tattoo Together",
    icon: <Pen className="text-love-gold" size={24} />,
    description: "Ink on skin, love etched deeper. Our first tattoo — a symbol of forever.",
    image: new URL('../images/IMG_20250806_171111_882.webp', import.meta.url).href,
  }
];

export default function Timeline() {
  return (
    <section id="timeline" className="py-32 bg-transparent relative">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-7xl font-serif mb-4 italic">Our Journey Together</h2>
          <div className="w-24 h-1 bg-love-red mx-auto mt-4" />
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

          <div className="space-y-32">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}
              >
                {/* Content */}
                <div className={`flex-1 w-full text-center ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className={`flex items-center gap-4 mb-4 justify-center ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                    <span className="text-love-gold font-sans tracking-[0.2em] text-sm uppercase">
                      {event.date}
                    </span>
                    <div className="bg-white/5 p-2 rounded-full border border-white/10">
                      {event.icon}
                    </div>
                  </div>
                  <h3 className="text-3xl font-serif mb-4">{event.title}</h3>
                  <p className="text-gray-400 font-sans leading-relaxed max-w-md mx-auto md:mx-0 inline-block">
                    {event.description}
                  </p>
                </div>

                {/* Point */}
                <div className="z-10 bg-love-red w-4 h-4 rounded-full ring-8 ring-love-red/20 hidden md:block" />

                {/* Image */}
                <div className="flex-1 w-full perspective-1000">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotateY: index % 2 === 0 ? 5 : -5 }}
                    className="aspect-[4/3] rounded-sm overflow-hidden shadow-2xl transition-all duration-500 ring-1 ring-white/10"
                  >
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
