import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/Button";
import { MapPin, Camera, Bell, CheckCircle2, Shield, Users, Facebook, Twitter, Instagram, Youtube, Building2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ReviewsCarousel } from "../components/ReviewsCarousel";
import { useState, useEffect } from "react";

const buenaventuraImages = [
  {
    url: "https://images.unsplash.com/photo-1635519810080-c6da52d4bf75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWVuYXZlbnR1cmElMjBjb2xvbWJpYSUyMGJlYWNofGVufDF8fHx8MTc3MzYwNjQwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Playas de Buenaventura"
  },
  {
    url: "https://images.unsplash.com/photo-1709952843965-823ccb545615?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvYXN0YWwlMjBjaXR5JTIwc3Vuc2V0fGVufDF8fHx8MTc3MzYwNjQwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Atardecer en la Costa"
  },
  {
    url: "https://images.unsplash.com/photo-1764202980476-5425629eddbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvbWJpYSUyMGNvYXN0YWwlMjB3YXRlcmZyb250fGVufDF8fHx8MTc3MzYwNjQxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Zona Costera"
  },
  {
    url: "https://images.unsplash.com/photo-1640706722267-609637faa004?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGNpdHklMjBjb2xvbWJpYXxlbnwxfHx8fDE3NzM2MDY0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "Ciudad Tropical"
  }
];

export function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % buenaventuraImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Buenaventura Reporta</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/entity/select">
                <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Building2 className="w-4 h-4 mr-2" />
                  Acceso Entidades
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">Iniciar sesión</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="sm">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Full Background Image Carousel */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <ImageWithFallback
              src={buenaventuraImages[currentImageIndex].url}
              alt={buenaventuraImages[currentImageIndex].title}
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                  Juntos construimos una mejor <span className="text-yellow-400">Buenaventura</span>
                </h2>
                <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg">
                  Plataforma ciudadana para reportar incidencias urbanas y mejorar nuestra ciudad. 
                  Tu voz importa, tu reporte genera cambio.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/map">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                      <Camera className="w-6 h-6 mr-2" />
                      Reportar incidencia
                    </Button>
                  </Link>
                  <Link to="/map">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                      Ver mapa de reportes
                    </Button>
                  </Link>
                </div>

                {/* Image indicators */}
                <div className="flex gap-3 mt-12">
                  {buenaventuraImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'w-12 bg-yellow-400' 
                          : 'w-8 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ver imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="text-white text-center">
            <p className="text-sm mb-2">Desliza para conocer más</p>
            <div className="w-6 h-10 border-2 border-white rounded-full mx-auto flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h3>
            <p className="text-lg text-gray-600">Reportar problemas nunca fue tan fácil</p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Camera, title: "1. Toma una foto", desc: "Captura el problema que encontraste en tu comunidad", color: "bg-yellow-100 text-yellow-600" },
              { icon: MapPin, title: "2. Marca la ubicación", desc: "El sistema detecta automáticamente la ubicación", color: "bg-green-100 text-green-600" },
              { icon: Bell, title: "3. Envía el reporte", desc: "Tu reporte llega a las autoridades competentes", color: "bg-yellow-200 text-yellow-700" },
              { icon: CheckCircle2, title: "4. Haz seguimiento", desc: "Recibe actualizaciones sobre la solución del problema", color: "bg-green-200 text-green-700" },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1674484356491-45139dcc0fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXRpemVuJTIwY29tbXVuaXR5JTIwaGVscGluZyUyMHVyYmFufGVufDF8fHx8MTc3MzMzNTEwN3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Comunidad colaborando"
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Participación ciudadana al alcance de tu mano
              </h3>
              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Seguridad y privacidad", desc: "Tus datos están protegidos y tu identidad es confidencial", color: "bg-green-100 text-green-600" },
                  { icon: Users, title: "Comunidad activa", desc: "Únete a miles de ciudadanos que trabajan por una mejor ciudad", color: "bg-yellow-100 text-yellow-600" },
                  { icon: CheckCircle2, title: "Resultados verificables", desc: "Seguimiento en tiempo real del estado de tus reportes", color: "bg-green-200 text-green-700" },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Carousel */}
      <section className="bg-gradient-to-r from-yellow-50 to-green-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros ciudadanos
            </h3>
            <p className="text-lg text-gray-600">
              Miles de personas ya están haciendo la diferencia
            </p>
          </motion.div>
          <ReviewsCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para hacer la diferencia?
          </h3>
          <p className="text-lg text-green-100 mb-8">
            Únete a Buenaventura Reporta y ayuda a mejorar tu ciudad
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Crear cuenta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-green-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Buenaventura Reporta</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma ciudadana para el bienestar de nuestra ciudad. Juntos construimos un mejor futuro.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link to="/map" className="hover:text-white transition-colors">Ver reportes</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4">Síguenos en redes sociales</h4>
              <div className="flex gap-3">
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <Youtube className="w-5 h-5 text-white" />
                </motion.a>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Mantente informado sobre las novedades y mejoras de la ciudad.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Buenaventura Reporta. Plataforma ciudadana para el bienestar de nuestra ciudad.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}