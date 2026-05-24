import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { Search, User, Shield, ShieldOff, Eye, X, Mail, Calendar, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { getAllUsers, updateUserStatus, updateUserRole } from "../../../lib/admin";
import { useEffect } from "react";

type UserStatus = "activo" | "inactivo" | "suspendido";

export function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await getAllUsers();
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.estado === statusFilter;
    const isCitizen = user.rol === 'ciudadano' || !user.rol; // Asumir ciudadano por defecto

    return matchesSearch && matchesStatus && isCitizen;
  });

  const statusCounts = {
    activo: users.filter(u => u.estado === "activo" && (u.rol === 'ciudadano' || !u.rol)).length,
    inactivo: users.filter(u => u.estado === "inactivo" && (u.rol === 'ciudadano' || !u.rol)).length,
    suspendido: users.filter(u => u.estado === "suspendido" && (u.rol === 'ciudadano' || !u.rol)).length,
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      toast.error("Por favor ingresa un motivo de bloqueo");
      return;
    }

    const { error } = await updateUserStatus(selectedUser.id, 'inactivo', blockReason);
    if (error) {
      toast.error("Error al bloquear usuario");
      return;
    }

    fetchUsers();
    setShowBlockModal(false);
    setShowDetailModal(false);
    setBlockReason("");
    setSelectedUser(null);

    toast.success("Usuario bloqueado correctamente");
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !blockReason.trim()) {
      toast.error("Por favor ingresa un motivo de suspensión");
      return;
    }

    const { error } = await updateUserStatus(selectedUser.id, 'suspendido', blockReason);
    if (error) {
      toast.error("Error al suspender usuario");
      return;
    }

    fetchUsers();
    setShowBlockModal(false);
    setShowDetailModal(false);
    setBlockReason("");
    setSelectedUser(null);

    toast.success("Usuario suspendido temporalmente");
  };

  const handleUnblockUser = async (userId: string) => {
    const { error } = await updateUserStatus(userId, 'activo');
    if (error) {
      toast.error("Error al desbloquear usuario");
      return;
    }

    fetchUsers();
    setShowDetailModal(false);
    setSelectedUser(null);

    toast.success("Usuario desbloqueado correctamente");
  };

  const handlePromoteToAdmin = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas promover a este usuario a ADMINISTRADOR? Esta acción le dará acceso total al panel de control.")) {
      return;
    }

    const { error } = await updateUserRole(userId, 'administrador');
    if (error) {
      toast.error("Error al promover usuario");
      return;
    }

    fetchUsers();
    toast.success("Usuario promovido a administrador correctamente");
  };

  const handleDemoteToUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas quitar los permisos de administrador a este usuario?")) {
      return;
    }

    const { error } = await updateUserRole(userId, 'ciudadano');
    if (error) {
      toast.error("Error al quitar permisos");
      return;
    }

    fetchUsers();
    toast.success("Permisos de administrador revocados");
  };

  const openDetailModal = (user: any) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openBlockModal = (user: any) => {
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
                <p className="text-sm text-red-800 font-medium mb-1">Inactivos / Bloqueados</p>
                <p className="text-3xl font-bold text-red-900">{statusCounts.inactivo}</p>
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
            <option value="inactivo">Inactivos / Bloqueados</option>
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
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-green-600 rounded-full flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">{user.nombre_completo || 'Usuario'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{user.reportes_creados || 0}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                        <div
                          className={`h-2 rounded-full ${(user.puntuacion_reputacion || 0) >= 80 ? 'bg-green-500' :
                            (user.puntuacion_reputacion || 0) >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(Math.max(user.puntuacion_reputacion || 0, 0), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user.puntuacion_reputacion || 0}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        user.estado === "activo" ? "success" :
                          user.estado === "suspendido" ? "warning" :
                            "danger"
                      }
                    >
                      {user.estado === "activo" ? "Activo" :
                        user.estado === "suspendido" ? "Suspendido" :
                          "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(user.fecha_creacion).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.estado === "activo" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openBlockModal(user)}
                        >
                          <Shield className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                      {(user.estado === "inactivo" || user.estado === "suspendido") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          <Shield className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      {user.rol !== 'administrador' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromoteToAdmin(user.id)}
                          title="Promover a Admin"
                        >
                          <ShieldOff className="w-4 h-4 text-blue-600" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDemoteToUser(user.id)}
                          title="Quitar permisos Admin"
                        >
                          <ShieldOff className="w-4 h-4 text-orange-600" />
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
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.nombre_completo || 'Usuario'}</h3>
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
                    <p className="text-2xl font-bold text-gray-900">{selectedUser.reportes_creados || 0}</p>
                  </Card>

                  <Card>
                    <p className="text-sm text-gray-600 mb-1">Reputación</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${(selectedUser.puntuacion_reputacion || 0) >= 80 ? 'bg-green-500' :
                            (selectedUser.puntuacion_reputacion || 0) >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(Math.max(selectedUser.puntuacion_reputacion || 0, 0), 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{selectedUser.puntuacion_reputacion || 0}</span>
                    </div>
                  </Card>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Fecha de registro:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedUser.fecha_creacion).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Estado:</span>
                    <Badge
                      variant={
                        selectedUser.estado === "activo" ? "success" :
                          selectedUser.estado === "suspendido" ? "warning" :
                            "danger"
                      }
                    >
                      {selectedUser.estado === "activo" ? "Activo" :
                        selectedUser.estado === "suspendido" ? "Suspendido" :
                          "Bloqueado"}
                    </Badge>
                  </div>
                </div>

                {/* Blocked Reason */}
                {selectedUser.motivo_bloqueo && (
                  <Card className="bg-red-50 border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">
                          Motivo de {selectedUser.estado === "bloqueado" ? "bloqueo" : "suspensión"}
                        </p>
                        <p className="text-sm text-red-700">{selectedUser.motivo_bloqueo}</p>
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
                  {selectedUser.estado === "activo" && (
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
                  {(selectedUser.estado === "inactivo" || selectedUser.estado === "suspendido") && (
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
                  Estás a punto de moderar al usuario <strong>{selectedUser.nombre_completo}</strong>
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
