import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "JESUS EDUARDO ESTUPIÑAN HERNANDEZ",
    avatar: "JH",
    rating: 5,
    comment: "Excelente plataforma. Reporté un semáforo dañado y fue reparado en solo 3 días. ¡Increíble!",
    date: "15 Feb 2026",
  },
  {
    id: 2,
    name: "DANIEL ENRIQUE RENTERIA HURTADO",
    avatar: "DH",
    rating: 5,
    comment: "Me encanta poder contribuir al mejoramiento de nuestra ciudad. La app es muy fácil de usar.",
    date: "10 Feb 2026",
  },
  {
    id: 3,
    name: "EDWARD SANTIAGO MAY RESTREPO",
    avatar: "ER",
    rating: 4,
    comment: "Gran iniciativa ciudadana. He visto mejoras reales en mi barrio gracias a esta plataforma.",
    date: "5 Feb 2026",
  },
  {
    id: 4,
    name: "SEBASTIAN GOMEZ",
    avatar: "SG",
    rating: 5,
    comment: "Finalmente tenemos una forma efectiva de comunicar los problemas de nuestra comunidad.",
    date: "1 Feb 2026",
  },
  {
    id: 5,
    name: "ANDRES FELIPE ANDRADE CUASAPUD",
    avatar: "AC",
    rating: 5,
    comment: "La transparencia en el seguimiento de reportes es fantástica. Sabemos exactamente qué está pasando.",
    date: "28 Ene 2026",
  },
  {
    id: 6,
    name: "JOSE MANUEL BONILLA PAYAN",
    avatar: "JP",
    rating: 4,
    comment: "Una herramienta muy útil para todos los ciudadanos. Recomendada 100%.",
    date: "20 Ene 2026",
  },
];

// Los nombres vienen en mayúsculas; se muestran en formato de nombre propio
const toTitleCase = (name: string) =>
  name.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

// Se duplican las reseñas para que el desplazamiento continuo no tenga cortes
const duplicatedReviews = [...reviews, ...reviews];

export function ReviewsCarousel() {
  return (
    <div className="group relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
      <ul className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
        {duplicatedReviews.map((review, index) => (
          <li
            key={`${review.id}-${index}`}
            aria-hidden={index >= reviews.length ? true : undefined}
            className="flex w-80 shrink-0 flex-col rounded-2xl border border-brand-900/10 bg-white p-6 sm:w-96"
          >
            <div className="flex gap-0.5" role="img" aria-label={`${review.rating} de 5 estrellas`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  aria-hidden="true"
                  className={`w-4 h-4 ${i < review.rating ? "fill-sun-400 text-sun-400" : "text-gray-300"}`}
                />
              ))}
            </div>

            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-gray-800 text-pretty">
              “{review.comment}”
            </blockquote>

            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white" aria-hidden="true">
                {review.avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-brand-900">{toTitleCase(review.name)}</p>
                <p className="text-sm text-gray-600">{review.date}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
