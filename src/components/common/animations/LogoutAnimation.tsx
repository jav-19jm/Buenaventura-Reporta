import { motion } from "motion/react";
import { LogOut } from "lucide-react";

interface LogoutAnimationProps {
  onComplete: () => void;
}

export function LogoutAnimation({ onComplete }: LogoutAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-yellow-600 via-green-700 to-yellow-700"
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 0] }}
        transition={{ duration: 1.2 }}
        className="text-center"
        onAnimationComplete={onComplete}
      >
        {/* Animated Emoji */}
        <motion.div
          initial={{ scale: 1, rotate: 0 }}
          animate={{ 
            scale: [1, 1.3, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ 
            duration: 1.2,
          }}
          className="text-8xl mb-6 filter drop-shadow-lg"
        >
          👋
        </motion.div>

        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            duration: 0.8,
            repeat: 1,
          }}
          className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl"
        >
          <LogOut className="w-12 h-12 text-yellow-600" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-4xl font-bold text-white"
        >
          ¡Hasta pronto!
        </motion.h2>

        {/* Efecto de ondas expandiéndose */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, delay: i * 0.2 }}
            className="absolute inset-0 border-4 border-white rounded-full"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}