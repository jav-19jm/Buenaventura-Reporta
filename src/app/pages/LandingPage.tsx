import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { MapPin, Camera, Bell, CheckCircle2, Shield, Users } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Buenaventura Reporta</h1>
            </div>
            <div className="flex items-center gap-3">
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Juntos construimos una mejor <span className="text-blue-600">Buenaventura</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Plataforma ciudadana para reportar incidencias urbanas y mejorar nuestra ciudad. 
              Tu voz importa, tu reporte genera cambio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/map">
                <Button size="lg" className="w-full sm:w-auto">
                  <Camera className="w-5 h-5 mr-2" />
                  Reportar incidencia
                </Button>
              </Link>
              <Link to="/map">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver mapa de reportes
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1764978588978-eb242701933c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidWVuYXZlbnR1cmElMjBjb2xvbWJpYSUyMGNpdHklMjBhZXJpYWx8ZW58MXx8fHwxNzczMzM1MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Ciudad de Buenaventura"
              className="rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h3>
            <p className="text-lg text-gray-600">Reportar problemas nunca fue tan fácil</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Toma una foto</h4>
              <p className="text-sm text-gray-600">Captura el problema que encontraste en tu comunidad</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Marca la ubicación</h4>
              <p className="text-sm text-gray-600">El sistema detecta automáticamente la ubicación</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Envía el reporte</h4>
              <p className="text-sm text-gray-600">Tu reporte llega a las autoridades competentes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-yellow-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Haz seguimiento</h4>
              <p className="text-sm text-gray-600">Recibe actualizaciones sobre la solución del problema</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1674484356491-45139dcc0fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXRpemVuJTIwY29tbXVuaXR5JTIwaGVscGluZyUyMHVyYmFufGVufDF8fHx8MTc3MzMzNTEwN3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Comunidad colaborando"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Participación ciudadana al alcance de tu mano
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Seguridad y privacidad</h4>
                    <p className="text-sm text-gray-600">Tus datos están protegidos y tu identidad es confidencial</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Comunidad activa</h4>
                    <p className="text-sm text-gray-600">Únete a miles de ciudadanos que trabajan por una mejor ciudad</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Resultados verificables</h4>
                    <p className="text-sm text-gray-600">Seguimiento en tiempo real del estado de tus reportes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            ¿Listo para hacer la diferencia?
          </h3>
          <p className="text-lg text-blue-100 mb-8">
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
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 Buenaventura Reporta. Plataforma ciudadana para el bienestar de nuestra ciudad.
          </p>
        </div>
      </footer>
    </div>
  );
}
