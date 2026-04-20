import { motion } from "motion/react";
import { MapPin, Sparkles } from "lucide-react";

interface WelcomeAnimationProps {
  userName: string;
  onComplete: () => void;
}

export function WelcomeAnimation({ userName, onComplete }: WelcomeAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-yellow-500 via-green-600 to-yellow-600"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="text-center"
        onAnimationComplete={onComplete}
      >
        {/* Animated Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [0, 360, 360],
          }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-8xl mb-6 filter drop-shadow-lg"
        >
          👋
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
        >
          <MapPin className="w-16 h-16 text-green-600" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-5xl font-bold text-white mb-4"
        >
          ¡Bienvenido{userName && `, ${userName}`}!
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex items-center justify-center gap-2 text-white text-xl"
        >
          <Sparkles className="w-6 h-6" />
          <span>Tu ciudad te necesita</span>
          <Sparkles className="w-6 h-6" />
        </motion.div>

        {/* Partículas animadas */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.random() * 400 - 200,
              y: Math.random() * 400 - 200,
            }}
            transition={{
              duration: 2,
              delay: 0.9 + Math.random() * 0.5,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: "50%",
              top: "50%",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}