import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, AlertCircle } from "lucide-react";
import { DataTable } from "../components/ui/DataTable";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/FormInput";
import { Alert } from "../components/ui/FormInput";
import { ConfirmDialog } from "../components/ConfirmDialog";
import UserModal from "../components/UserModal";
import api from "../utils/api";
import { formatDate, formatUserRole, formatActiveStatus } from "../utils/formatters";

/**
 * User Management Page
 * CRUD operations for users (admin only)
 */
export default function ManajemenUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Confirm dialog states
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmToggle, setShowConfirmToggle] = useState(false);
  const [userToAction, setUserToAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/auth/users");
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(
        err.response?.data?.message || "Gagal memuat data pengguna"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowUserModal(true);
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleOpenDeleteConfirm = (user) => {
    setUserToAction(user);
    setShowConfirmDelete(true);
  };

  const handleOpenToggleConfirm = (user) => {
    setUserToAction(user);
    setShowConfirmToggle(true);
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/auth/users/${userToAction.id}`);
      setShowConfirmDelete(false);
      setUserToAction(null);
      await loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.response?.data?.message || "Gagal menghapus pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setActionLoading(true);
      await api.put(`/auth/users/${userToAction.id}/toggle-active`);
      setShowConfirmToggle(false);
      setUserToAction(null);
      await loadUsers();
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError(err.response?.data?.message || "Gagal mengubah status pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserSaved = async () => {
    setShowUserModal(false);
    setSelectedUser(null);
    await loadUsers();
  };

  // Column definitions for DataTable
  const columns = [
    {
      key: "username",
      label: "Username",
      sortable: true,
      width: "150px",
    },
    {
      key: "nama",
      label: "Nama Lengkap",
      sortable: true,
      width: "200px",
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      width: "100px",
      render: (value) => {
        const roleInfo = formatUserRole(value);
        return (
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${roleInfo.bg} ${roleInfo.text}`}>
            {roleInfo.label}
          </span>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      width: "100px",
      render: (value) => {
        const statusInfo = formatActiveStatus(value);
        return (
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Dibuat",
      sortable: true,
      width: "120px",
      render: (value) => formatDate(value),
    },
  ];

  // Actions for DataTable rows
  const actions = {
    edit: {
      label: "Edit",
      onClick: (row) => handleOpenEditModal(row),
      variant: "blue",
    },
    toggle: {
      label: userToAction?.is_active ? "Nonaktifkan" : "Aktifkan",
      onClick: (row) => handleOpenToggleConfirm(row),
      variant: "warning",
    },
    delete: {
      label: "Hapus",
      onClick: (row) => handleOpenDeleteConfirm(row),
      variant: "danger",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-600 mt-1">
            Kelola pengguna sistem, atur role, dan status aktivitas
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Tambah Pengguna
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-semibold"
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* Users Table Card */}
      <Card>
        <CardBody className="p-0">
          <DataTable
            data={users}
            columns={columns}
            actions={actions}
            searchable={true}
            pageSize={10}
            loading={loading}
            emptyMessage="Tidak ada pengguna"
            onRowClick={(row) => handleOpenEditModal(row)}
          />
        </CardBody>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardBody className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">Informasi Role</h3>
            <p className="text-sm text-blue-800 mt-1">
              <strong>Admin:</strong> Akses penuh ke semua fitur sistem
              <br />
              <strong>Staff:</strong> Hanya dapat melihat menu Croscek Karyawan dan Karyawan DW
            </p>
          </div>
        </CardBody>
      </Card>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
          setIsEditing(false);
        }}
        user={selectedUser}
        isEditing={isEditing}
        onSave={handleUserSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Hapus Pengguna?"
        message={`Apakah Anda yakin ingin menghapus pengguna "${userToAction?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowConfirmDelete(false);
          setUserToAction(null);
        }}
        loading={actionLoading}
      />

      {/* Toggle Active Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmToggle}
        title={userToAction?.is_active ? "Nonaktifkan Pengguna?" : "Aktifkan Pengguna?"}
        message={
          userToAction?.is_active
            ? `Pengguna "${userToAction?.nama}" akan tidak dapat login ke sistem.`
            : `Pengguna "${userToAction?.nama}" dapat login ke sistem kembali.`
        }
        variant={userToAction?.is_active ? "warning" : "success"}
        confirmLabel={userToAction?.is_active ? "Nonaktifkan" : "Aktifkan"}
        cancelLabel="Batal"
        onConfirm={handleToggleActive}
        onCancel={() => {
          setShowConfirmToggle(false);
          setUserToAction(null);
        }}
        loading={actionLoading}
      />
    </div>
  );
}
