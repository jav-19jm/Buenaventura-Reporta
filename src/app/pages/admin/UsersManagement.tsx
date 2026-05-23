import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Search, User, Shield, ShieldOff, Eye, X, Mail, Calendar, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const mockUsers = [
  {
    id: "user123",
    name: "María González",
    email: "maria.gonzalez@email.com",
    status: "activo" as const,
    reportsCount: 12,
    joinDate: "2026-01-15",
    reputation: 85,
    lastActivity: "2026-04-10",
    blockedReason: null
  },
  {
    id: "user456",
    name: "Carlos Pérez",
    email: "carlos.perez@email.com",
    status: "activo" as const,
    reportsCount: 8,
    joinDate: "2026-02-20",
    reputation: 92,
    lastActivity: "2026-04-12",
    blockedReason: null
  },
  {
    id: "user789",
    name: "Ana Rodríguez",
    email: "ana.rodriguez@email.com",
    status: "activo" as const,
    reportsCount: 25,
    joinDate: "2025-11-10",
    reputation: 98,
    lastActivity: "2026-04-09",
    blockedReason: null
  },
  {
    id: "user321",
    name: "Juan Martínez",
    email: "juan.martinez@email.com",
    status: "bloqueado" as const,
    reportsCount: 3,
    joinDate: "2026-03-05",
    reputation: 15,
    lastActivity: "2026-04-01",
    blockedReason: "Múltiples reportes falsos detectados"
  },
  {
    id: "user654",
    name: "Laura Sánchez",
    email: "laura.sanchez@email.com",
    status: "activo" as const,
    reportsCount: 15,
    joinDate: "2026-01-28",
    reputation: 88,
    lastActivity: "2026-04-15",
    blockedReason: null
  },
  {
    id: "user987",
    name: "Roberto Torres",
    email: "roberto.torres@email.com",
    status: "suspendido" as const,
    reportsCount: 5,
    joinDate: "2026-03-12",
    reputation: 45,
    lastActivity: "2026-04-14",
    blockedReason: "Comportamiento inapropiado en comentarios"
  }
];

type UserStatus = "activo" | "bloqueado" | "suspendido";

export function UsersManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    activo: users.filter(u => u.status === "activo").length,
    bloqueado: users.filter(u => u.status === "bloqueado").length,
    suspendido: users.filter(u => u.status === "suspendido").length,
  };

  const handleBlockUser = () => {
    if (!selectedUser || !blockReason.trim()) {
      toast.error("Por favor ingresa un motivo de bloqueo");
      return;
    }

    setUsers(users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          status: "bloqueado" as const,
          blockedReason: blockReason
        };
      }
      return user;
    }));

    setShowBlockModal(false);
    setShowDetailModal(false);
    setBlockReason("");
    setSelectedUser(null);
    
    toast.success("Usuario bloqueado correctamente", {
      description: "El usuario no podrá crear nuevos reportes"
    });
  };

  const handleSuspendUser = () => {
    if (!selectedUser || !blockReason.trim()) {
      toast.error("Por favor ingresa un motivo de suspensión");
      return;
    }

    setUsers(users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          status: "suspendido" as const,
          blockedReason: blockReason
        };
      }
      return user;
    }));

    setShowBlockModal(false);
    setShowDetailModal(false);
    setBlockReason("");
    setSelectedUser(null);
    
    toast.success("Usuario suspendido temporalmente", {
      description: "El usuario tiene acceso limitado a la plataforma"
    });
  };

  const handleUnblockUser = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          status: "activo" as const,
          blockedReason: null
        };
      }
      return user;
    }));

    setShowDetailModal(false);
    setSelectedUser(null);
    
    toast.success("Usuario desbloqueado correctamente", {
      description: "El usuario puede crear reportes nuevamente"
    });
  };

  const openDetailModal = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openBlockModal = (user: typeof mockUsers[0]) => {
    setSelectedUser(user);
    setShowBlockModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">Usuarios Activos</p>
                <p className="text-3xl font-bold text-green-900">{statusCounts.activo}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800 font-medium mb-1">Suspendidos</p>
                <p className="text-3xl font-bold text-yellow-900">{statusCounts.suspendido}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">Bloqueados</p>
                <p className="text-3xl font-bold text-red-900">{statusCounts.bloqueado}</p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                <ShieldOff className="w-6 h-6 text-red-700" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="suspendido">Suspendidos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900">Usuarios ({filteredUsers.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reportes</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reputación</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Última Actividad</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.reportsCount}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                        <div
                          className={`h-2 rounded-full ${
                            user.reputation >= 80 ? 'bg-green-500' :
                            user.reputation >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${user.reputation}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.reputation}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant={
                        user.status === "activo" ? "success" :
                        user.status === "suspendido" ? "warning" :
                        "danger"
                      }
                    >
                      {user.status === "activo" ? "Activo" :
                       user.status === "suspendido" ? "Suspendido" :
                       "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.lastActivity}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.status === "activo" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBlockModal(user)}
                        >
                          <ShieldOff className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      {(user.status === "bloqueado" || user.status === "suspendido") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          <Shield className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalle del Usuario</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <p className="text-sm text-gray-600 mb-1">Reportes Creados</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.reportsCount}</p>
                  </Card>

                  <Card>
                    <p className="text-sm text-gray-600 mb-1">Reputación</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            selectedUser.reputation >= 80 ? 'bg-green-500' :
                            selectedUser.reputation >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${selectedUser.reputation}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{selectedUser.reputation}%</span>
                    </div>
                  </Card>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Fecha de registro:</span>
                    <span className="font-medium text-gray-900">{selectedUser.joinDate}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Última actividad:</span>
                    <span className="font-medium text-gray-900">{selectedUser.lastActivity}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Estado:</span>
                    <Badge 
                      variant={
                        selectedUser.status === "activo" ? "success" :
                        selectedUser.status === "suspendido" ? "warning" :
                        "danger"
                      }
                    >
                      {selectedUser.status === "activo" ? "Activo" :
                       selectedUser.status === "suspendido" ? "Suspendido" :
                       "Bloqueado"}
                    </Badge>
                  </div>
                </div>

                {/* Blocked Reason */}
                {selectedUser.blockedReason && (
                  <Card className="bg-red-50 border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">
                          Motivo de {selectedUser.status === "bloqueado" ? "bloqueo" : "suspensión"}
                        </p>
                        <p className="text-sm text-red-700">{selectedUser.blockedReason}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cerrar
                  </Button>
                  {selectedUser.status === "activo" && (
                    <Button
                      variant="danger"
                      onClick={() => {
                        setShowDetailModal(false);
                        openBlockModal(selectedUser);
                      }}
                    >
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Bloquear / Suspender
                    </Button>
                  )}
                  {(selectedUser.status === "bloqueado" || selectedUser.status === "suspendido") && (
                    <Button
                      variant="primary"
                      onClick={() => handleUnblockUser(selectedUser.id)}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Desbloquear Usuario
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block/Suspend Modal */}
      <AnimatePresence>
        {showBlockModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowBlockModal(false);
              setBlockReason("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-50 border-b border-red-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  Moderar Usuario
                </h2>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason("");
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Estás a punto de moderar al usuario <strong>{selectedUser.name}</strong>
                </p>

                <Textarea
                  label="Motivo de la acción"
                  placeholder="Describe el motivo del bloqueo o suspensión..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={4}
                  required
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowBlockModal(false);
                      setBlockReason("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="warning"
                    className="flex-1"
                    onClick={handleSuspendUser}
                    disabled={!blockReason.trim()}
                  >
                    Suspender
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={handleBlockUser}
                    disabled={!blockReason.trim()}
                  >
                    Bloquear
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
