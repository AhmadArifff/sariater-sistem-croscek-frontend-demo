import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { FormInput, Button } from "./ui/FormInput";
import api from "../utils/api";

/**
 * User Modal Component
 * Form for creating and editing users
 */
export default function UserModal({ isOpen, onClose, user, isEditing, onSave }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    nama: "",
    password: "",
    confirmPassword: "",
    role: "staff",
  });

  // Initialize form data when user changes
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        username: user.username || "",
        nama: user.nama || "",
        password: "",
        confirmPassword: "",
        role: user.role || "staff",
      });
    } else {
      setFormData({
        username: "",
        nama: "",
        password: "",
        confirmPassword: "",
        role: "staff",
      });
    }
    setError(null);
  }, [isOpen, user, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.username.trim()) {
      setError("Username harus diisi");
      return false;
    }
    if (!formData.nama.trim()) {
      setError("Nama lengkap harus diisi");
      return false;
    }

    // Check username format
    if (formData.username.length < 3) {
      setError("Username minimal 3 karakter");
      return false;
    }

    // Check password for new users
    if (!isEditing) {
      if (!formData.password) {
        setError("Password harus diisi");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password minimal 8 karakter");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok");
        return false;
      }
    } else {
      // For editing, password is optional but if provided must match
      if (formData.password && formData.password.length < 8) {
        setError("Password minimal 8 karakter");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        // Update existing user
        const updateData = {
          nama: formData.nama,
          role: formData.role,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/auth/users/${user.id}`, updateData);
      } else {
        // Create new user
        await api.post("/auth/users", {
          username: formData.username,
          nama: formData.nama,
          password: formData.password,
          role: formData.role,
        });
      }

      // Reset form and close modal
      setFormData({
        username: "",
        nama: "",
        password: "",
        confirmPassword: "",
        role: "staff",
      });

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving user:", err);
      setError(
        err.response?.data?.message ||
          `Gagal ${isEditing ? "mengubah" : "membuat"} pengguna`
      );
    } finally {
      setLoading(false);
    }
  };

  const modalFooter = (
    <div className="flex gap-2 justify-end">
      <Button
        variant="secondary"
        size="md"
        onClick={onClose}
        disabled={loading}
      >
        Batal
      </Button>
      <Button
        variant="primary"
        size="md"
        onClick={handleSubmit}
        loading={loading}
      >
        {isEditing ? "Ubah" : "Buat"} Pengguna
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Pengguna" : "Buat Pengguna Baru"}
      footer={modalFooter}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Username Field */}
        <FormInput
          label="Username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          placeholder="Masukkan username"
          required
          disabled={isEditing} // Can't change username when editing
          hint={
            isEditing
              ? "Username tidak dapat diubah"
              : "Minimal 3 karakter, hanya huruf dan angka"
          }
        />

        {/* Nama Field */}
        <FormInput
          label="Nama Lengkap"
          name="nama"
          type="text"
          value={formData.nama}
          onChange={handleChange}
          placeholder="Masukkan nama lengkap"
          required
        />

        {/* Role Field */}
        <FormInput
          label="Role"
          name="role"
          type="select"
          value={formData.role}
          onChange={handleChange}
          required
          options={[
            { value: "staff", label: "Staff - Akses Terbatas" },
            { value: "admin", label: "Admin - Akses Penuh" },
          ]}
        />

        {/* Password Field */}
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={
            isEditing
              ? "Biarkan kosong jika tidak ingin mengubah password"
              : "Masukkan password"
          }
          required={!isEditing}
          hint={
            isEditing
              ? "Minimal 8 karakter (opsional)"
              : "Minimal 8 karakter"
          }
        />

        {/* Confirm Password Field */}
        {formData.password && (
          <FormInput
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Konfirmasi password"
            required={!!formData.password}
            hint="Harus sama dengan password di atas"
          />
        )}
      </form>
    </Modal>
  );
}
