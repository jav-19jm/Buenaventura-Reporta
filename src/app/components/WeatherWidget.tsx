import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cloud, CloudRain, Sun, Wind, Droplets, ChevronDown, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";

export function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const lat = 3.8801;
        const lng = -77.0311;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`
        );
        const data = await response.json();
        
        if (data.current) {
          setWeatherData({
            city: "Buenaventura",
            temperature: Math.round(data.current.temperature_2m),
            humidity: data.current.relative_humidity_2m,
            windSpeed: Math.round(data.current.wind_speed_10m),
            precipitation: data.current.precipitation,
            code: data.current.weather_code,
          });
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Actualizar cada 30 minutos
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherConfig = (code: number) => {
    if (code === 0) return { icon: Sun, label: "Despejado", color: "text-yellow-500", border: "border-yellow-400" };
    if (code <= 3) return { icon: Cloud, label: "Nublado", color: "text-blue-400", border: "border-blue-400" };
    if (code >= 51 && code <= 67) return { icon: CloudRain, label: "Lluvia", color: "text-blue-600", border: "border-blue-500" };
    if (code >= 80 && code <= 82) return { icon: CloudRain, label: "Chubascos", color: "text-indigo-600", border: "border-indigo-400" };
    return { icon: Cloud, label: "Nublado", color: "text-gray-500", border: "border-gray-400" };
  };

  if (loading) {
    return (
      <div className="fixed top-20 right-4 z-40">
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-gray-100 flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-gray-500">Cargando clima...</span>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const config = getWeatherConfig(weatherData.code);
  const WeatherIcon = config.icon;

  return (
    <div className="fixed top-20 right-4 z-40">
      <motion.div
        initial={false}
        whileHover={{ scale: 1.05 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg border-2 ${config.border} hover:opacity-90 transition-all`}
        >
          <WeatherIcon className={`w-6 h-6 ${config.color}`} />
          <span className="font-medium text-gray-900">{weatherData.temperature}°C</span>
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
            <Card className="w-72 p-4 shadow-2xl border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 z-0" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{weatherData.city}</h3>
                    <p className="text-sm text-gray-600">{config.label}</p>
                  </div>
                  <WeatherIcon className={`w-12 h-12 ${config.color} drop-shadow-lg`} />
                </div>
                
                <div className="text-4xl font-black text-gray-900 mb-6">
                  {weatherData.temperature}°C
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <motion.div 
                    className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100"
                    whileHover={{ y: -5 }}
                  >
                    <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] uppercase font-bold text-blue-400">Humedad</p>
                    <p className="text-sm font-bold text-gray-900">{weatherData.humidity}%</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-green-50 rounded-xl p-3 text-center border border-green-100"
                    whileHover={{ y: -5 }}
                  >
                    <Wind className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] uppercase font-bold text-green-400">Viento</p>
                    <p className="text-sm font-bold text-gray-900">{weatherData.windSpeed} km/h</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100"
                    whileHover={{ y: -5 }}
                  >
                    <CloudRain className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                    <p className="text-[10px] uppercase font-bold text-indigo-400">Lluvia</p>
                    <p className="text-sm font-bold text-gray-900">{weatherData.precipitation}mm</p>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}