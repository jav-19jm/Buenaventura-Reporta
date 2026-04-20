import { Link } from "react-router";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { ReportCard } from "../components/ReportCard";
import { ArrowLeft, User, Award, TrendingUp, MapPin, LogOut } from "lucide-react";

export function ProfilePage() {
  // Mock user data
  const user = {
    name: "María González",
    email: "maria.gonzalez@email.com",
    memberSince: "Enero 2026",
    reputation: 850,
    level: "Ciudadano Activo",
  };

  const badges = [
    { id: 1, name: "Primer Reporte", icon: "🎯", earned: true },
    { id: 2, name: "10 Reportes", icon: "⭐", earned: true },
    { id: 3, name: "Solucionador", icon: "✅", earned: true },
    { id: 4, name: "50 Reportes", icon: "🏆", earned: false },
    { id: 5, name: "Embajador", icon: "👑", earned: false },
  ];

  const stats = [
    { label: "Reportes totales", value: "24", icon: MapPin, color: "text-blue-600" },
    { label: "Solucionados", value: "18", icon: Award, color: "text-green-600" },
    { label: "Reputación", value: user.reputation, icon: TrendingUp, color: "text-purple-600" },
  ];

  const myReports: Report[] = [
    {
      id: "1",
      type: "Luminaria dañada",
      description: "Poste de luz sin funcionar en la esquina",
      location: "Calle 5 con Carrera 3",
      date: "10 Mar 2026",
      status: "en-revision",
    },
    {
      id: "2",
      type: "Basura en vía pública",
      description: "Acumulación de basura en la esquina",
      location: "Av. Simón Bolívar",
      date: "11 Mar 2026",
      status: "solucionado",
    },
    {
      id: "3",
      type: "Semáforo dañado",
      description: "Semáforo no cambia de color",
      location: "Carrera 2 con Calle 10",
      date: "09 Mar 2026",
      status: "pendiente",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-4">
          <Link to="/map">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <h1 className="font-bold text-gray-900">Mi Perfil</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Card */}
            <Card className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-sm text-gray-600 mb-3">{user.email}</p>
              <Badge variant="info" className="mb-4">{user.level}</Badge>
              <p className="text-xs text-gray-500">Miembro desde {user.memberSince}</p>
            </Card>

            {/* Stats */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-sm text-gray-700">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Badges */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Insignias
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`text-center p-3 rounded-lg border-2 ${
                      badge.earned
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 bg-gray-50 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-xs text-gray-700">{badge.name}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Logout */}
            <Link to="/">
              <Button variant="outline" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </Link>
          </div>

          {/* Right Column - Reports History */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Mis Reportes</h3>
                <Link to="/report/new">
                  <Button size="sm">Nuevo reporte</Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {myReports.map((report) => (
                  <Link key={report.id} to={`/report/${report.id}`}>
                    <ReportCard report={report} />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
