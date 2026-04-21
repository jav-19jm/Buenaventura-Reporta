import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, CloudRain, Sun, Wind, Droplets, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "./ui/Card";

export function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock weather data
  const weather = {
    city: "Buenaventura",
    temperature: 28,
    condition: "Parcialmente nublado",
    humidity: 75,
    windSpeed: 12,
    precipitation: 40,
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      <motion.div
        initial={false}
        animate={{ scale: isOpen ? 1 : 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-400 hover:border-yellow-500 transition-colors"
        >
          <Sun className="w-6 h-6 text-yellow-500" />
          <span className="font-medium text-gray-900">{weather.temperature}°C</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </motion.div>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full right-0 mt-2"
          >
            <Card className="w-72 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{weather.city}</h3>
                  <p className="text-sm text-gray-600">{weather.condition}</p>
                </div>
                <Sun className="w-12 h-12 text-yellow-500 drop-shadow-lg" />
              </div>
              
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {weather.temperature}°C
              </div>

              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  className="bg-yellow-50 rounded-lg p-3 text-center border-2 border-yellow-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <Droplets className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Humedad</p>
                  <p className="text-sm font-semibold text-gray-900">{weather.humidity}%</p>
                </motion.div>
                
                <motion.div 
                  className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <Wind className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Viento</p>
                  <p className="text-sm font-semibold text-gray-900">{weather.windSpeed} km/h</p>
                </motion.div>
                
                <motion.div 
                  className="bg-yellow-100 rounded-lg p-3 text-center border-2 border-yellow-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <CloudRain className="w-5 h-5 text-yellow-700 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Lluvia</p>
                  <p className="text-sm font-semibold text-gray-900">{weather.precipitation}%</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}