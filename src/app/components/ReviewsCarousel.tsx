import { motion } from "motion/react";
import { Star, Quote } from "lucide-react";
import { Card } from "./ui/Card";

const reviews = [
  {
    id: 1,
    name: "Carlos Martínez",
    avatar: "👨🏽",
    rating: 5,
    comment: "Excelente plataforma. Reporté un semáforo dañado y fue reparado en solo 3 días. ¡Increíble!",
    date: "15 Feb 2026",
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    avatar: "👩🏻",
    rating: 5,
    comment: "Me encanta poder contribuir al mejoramiento de nuestra ciudad. La app es muy fácil de usar.",
    date: "10 Feb 2026",
  },
  {
    id: 3,
    name: "Luis Gómez",
    avatar: "👨🏿",
    rating: 4,
    comment: "Gran iniciativa ciudadana. He visto mejoras reales en mi barrio gracias a esta plataforma.",
    date: "5 Feb 2026",
  },
  {
    id: 4,
    name: "María Santos",
    avatar: "👩🏽",
    rating: 5,
    comment: "Finalmente tenemos una forma efectiva de comunicar los problemas de nuestra comunidad.",
    date: "1 Feb 2026",
  },
  {
    id: 5,
    name: "Pedro Mendoza",
    avatar: "👨🏾",
    rating: 5,
    comment: "La transparencia en el seguimiento de reportes es fantástica. Sabemos exactamente qué está pasando.",
    date: "28 Ene 2026",
  },
  {
    id: 6,
    name: "Laura Torres",
    avatar: "👩🏼",
    rating: 4,
    comment: "Una herramienta muy útil para todos los ciudadanos. Recomendada 100%.",
    date: "20 Ene 2026",
  },
];

// Duplicamos las reseñas para crear un loop infinito
const duplicatedReviews = [...reviews, ...reviews];

export function ReviewsCarousel() {
  return (
    <div className="relative overflow-hidden py-8">
      <motion.div
        animate={{
          x: [0, -50 * reviews.length + "%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
        className="flex gap-6"
      >
        {duplicatedReviews.map((review, index) => (
          <motion.div
            key={`${review.id}-${index}`}
            className="flex-shrink-0 w-96"
            whileHover={{ scale: 1.05 }}
          >
            <Card className="p-6 h-full">
              <Quote className="w-8 h-8 text-yellow-200 mb-4" />
              
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                "{review.comment}"
              </p>

              <div className="flex items-center gap-3 mt-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center text-2xl">
                  {review.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{review.name}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}