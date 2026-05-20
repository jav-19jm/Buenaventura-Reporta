import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function AdminDashboard() {
  // Mock data for charts
  const reportsByType = [
    { name: "Luminaria", value: 45 },
    { name: "Basura", value: 32 },
    { name: "Semáforo", value: 28 },
    { name: "Fuga agua", value: 15 },
    { name: "Incendio", value: 8 },
    { name: "Orden público", value: 12 },
  ];

  const reportsByStatus = [
    { name: "Pendiente", value: 35, color: "#f59e0b" },
    { name: "En revisión", value: 52, color: "#3b82f6" },
    { name: "Solucionado", value: 53, color: "#10b981" },
  ];

  const reportsByZone = [
    { zone: "Centro", reportes: 42 },
    { zone: "Norte", reportes: 38 },
    { zone: "Sur", reportes: 25 },
    { zone: "Este", reportes: 20 },
    { zone: "Oeste", reportes: 15 },
  ];

  const recentReports = [
    { id: "1", type: "Luminaria dañada", location: "Calle 5 con Carrera 3", status: "pendiente", time: "Hace 5 min" },
    { id: "2", type: "Basura", location: "Av. Simón Bolívar", status: "en-revision", time: "Hace 15 min" },
    { id: "3", type: "Semáforo dañado", location: "Carrera 2 con Calle 10", status: "solucionado", time: "Hace 1 hora" },
    { id: "4", type: "Fuga de agua", location: "Calle 8", status: "en-revision", time: "Hace 2 horas" },
  ];

  const stats = [
    { label: "Total reportes", value: "140", icon: TrendingUp, color: "bg-blue-100 text-blue-600" },
    { label: "Pendientes", value: "35", icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { label: "En revisión", value: "52", icon: AlertCircle, color: "bg-blue-100 text-blue-600" },
    { label: "Solucionados", value: "53", icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/user">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="font-bold text-gray-900">Panel Administrativo</h1>
          </div>
          <Link to="/user">
            <Button variant="outline" size="sm">Ver mapa</Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reports by Type */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Reportes por tipo de incidencia</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Reports by Status */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Distribución por estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Zones Chart */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Zonas con más incidencias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportsByZone} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="zone" type="category" />
              <Tooltip />
              <Bar dataKey="reportes" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Reports Table */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Reportes recientes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ubicación</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tiempo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acción</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => {
                  const statusVariant = {
                    pendiente: "warning" as const,
                    "en-revision": "info" as const,
                    solucionado: "success" as const,
                  };

                  const statusLabel = {
                    pendiente: "Pendiente",
                    "en-revision": "En Revisión",
                    solucionado: "Solucionado",
                  };

                  return (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">#{report.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{report.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.location}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusVariant[report.status as keyof typeof statusVariant]}>
                          {statusLabel[report.status as keyof typeof statusLabel]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{report.time}</td>
                      <td className="py-3 px-4">
                        <Link to={`/report/${report.id}`}>
                          <Button variant="ghost" size="sm">Ver detalles</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
