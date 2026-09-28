"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  PlusCircle,
  Settings,
  ChevronsUpDown,
  SquarePen,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { User } from "@/lib/types";
import { createUser, updateUser, deleteUser } from "@/lib/actions";
import Footer from "@/components/Footer";

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    status: true,
  });

  // Filter and sort
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField] ?? "";
        const valB = b[sortField] ?? "";
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [users, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user: User) => {
    const updatedStatus = !user.status;
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: updatedStatus } : u))
    );

    const res = await updateUser(user.id, { status: updatedStatus });
    if (!res.success) {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      alert(res.error || "Failed to update status");
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      status: true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      status: user.status ?? true,
    });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setErrorMsg("Please fill in first name, last name, and email");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      username: formData.username.trim() || formData.email.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      status: formData.status,
    };

    if (editingUser) {
      const res = await updateUser(editingUser.id, payload);
      if (res.success && res.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? res.data! : u))
        );
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to update user");
      }
    } else {
      const res = await createUser(payload);
      if (res.success && res.data) {
        setUsers((prev) => [res.data!, ...prev]);
        setIsModalOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to create user");
      }
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setIsModalOpen(false);
    } else {
      alert(res.error || "Failed to delete user");
    }
  };

  const handleExportCSV = () => {
    const headers = ["First Name", "Last Name", "Username", "Email", "Phone", "Status"];
    const rows = filteredUsers.map((u) => [
      `"${u.first_name}"`,
      `"${u.last_name}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.phone || ""}"`,
      u.status ? "Active" : "Inactive",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Users management
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="hover:text-gray-700 cursor-pointer">Users</span>
            <span>|</span>
            <span className="text-gray-400">Users management</span>
          </div>
        </div>

        {/* Purple Settings Gear Button */}
        <button
          title="Settings"
          className="w-8 h-8 rounded bg-[#7c3aed] text-white flex items-center justify-center hover:bg-purple-700 transition shadow-xs"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Action Controls Bar */}
      <div className="py-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search this table"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition shadow-2xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-3.5 py-1.5 border border-sky-400 text-sky-500 hover:bg-sky-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition">
            <Filter size={14} />
            <span>Filter</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 border border-emerald-400 text-emerald-500 hover:bg-emerald-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
          >
            <FileText size={14} />
            <span>PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 border border-rose-400 text-rose-500 hover:bg-rose-50 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={14} />
            <span>EXCEL</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-1.5 bg-[#7c3aed] text-white hover:bg-purple-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
          >
            <PlusCircle size={14} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Users Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white text-xs font-semibold text-gray-800">
                <th
                  onClick={() => handleSort("first_name")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>First name</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("last_name")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Last name</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("username")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Username</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("phone")}
                  className="py-3 px-4 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Phone</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-xs sm:text-sm font-normal"
                  >
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {user.first_name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      {user.last_name}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {user.username}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {user.phone || ""}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {/* Purple iOS-style Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                          ${user.status ? "bg-[#7c3aed]" : "bg-gray-300"}`}
                        role="switch"
                        aria-checked={user.status}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                            ${user.status ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {/* Green square border edit icon matching screenshot */}
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="inline-flex items-center justify-center p-1.5 border border-emerald-400 text-emerald-500 hover:bg-emerald-50 rounded transition"
                        title="Edit User"
                      >
                        <SquarePen size={15} strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-white text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-6">
            <span>
              {filteredUsers.length === 0
                ? "0 - 0 of 0"
                : `${startIndex + 1} - ${Math.min(
                    startIndex + rowsPerPage,
                    filteredUsers.length
                  )} of ${filteredUsers.length}`}
            </span>
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex items-center gap-1 disabled:opacity-40 hover:text-purple-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                <span>prev</span>
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex items-center gap-1 disabled:opacity-40 hover:text-purple-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Create / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-base text-gray-900">
                {editingUser ? "Edit User" : "Create New User"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs sm:text-sm">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="123456"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="font-medium text-gray-700">Status:</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, status: !formData.status })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none
                    ${formData.status ? "bg-[#7c3aed]" : "bg-gray-300"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                      ${formData.status ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                {editingUser ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(editingUser.id)}
                    className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-medium flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span>Delete User</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-1.5 bg-[#7c3aed] text-white rounded hover:bg-purple-700 text-xs font-medium disabled:opacity-50"
                  >
                    {loading
                      ? "Saving..."
                      : editingUser
                      ? "Update User"
                      : "Create User"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <Footer />
    </div>
  );
}

