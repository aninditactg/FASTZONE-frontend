"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  FileText,
  FileSpreadsheet,
  Download,
  PlusCircle,
  Settings,
  MoreVertical,
  ChevronsUpDown,
  X,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Supplier } from "@/lib/types";
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/lib/actions";
import Footer from "@/components/Footer";

interface SuppliersClientProps {
  initialSuppliers: Supplier[];
}

export default function SuppliersClient({
  initialSuppliers,
}: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set()
  );
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Supplier | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<
    number | string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    tax_number: "",
    total_purchase_due: "0.00",
    total_purchase_return_due: "0.00",
  });

  // Filtered and sorted suppliers
  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          String(s.code).toLowerCase().includes(q) ||
          (s.phone && s.phone.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.tax_number && s.tax_number.toLowerCase().includes(q))
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField] ?? "";
        const valB = b[sortField] ?? "";
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [suppliers, searchQuery, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedSuppliers.length && paginatedSuppliers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSuppliers.map((s) => s.id)));
    }
  };

  const toggleSelectOne = (id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleOpenCreate = () => {
    const maxCode = suppliers.reduce(
      (max, s) => (typeof s.code === "number" && s.code > max ? s.code : max),
      100
    );
    setFormData({
      code: String(maxCode + 1),
      name: "",
      phone: "",
      email: "",
      tax_number: "",
      total_purchase_due: "0.00",
      total_purchase_return_due: "0.00",
    });
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      code: String(supplier.code),
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      tax_number: supplier.tax_number || "",
      total_purchase_due: String(supplier.total_purchase_due || "0.00"),
      total_purchase_return_due: String(supplier.total_purchase_return_due || "0.00"),
    });
    setActionMenuOpenId(null);
    setErrorMsg(null);
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg("Name is required");
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      code: Number(formData.code) || undefined,
      name: formData.name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      tax_number: formData.tax_number.trim() || null,
      total_purchase_due: parseFloat(formData.total_purchase_due) || 0,
      total_purchase_return_due:
        parseFloat(formData.total_purchase_return_due) || 0,
    };

    if (editingSupplier) {
      const res = await updateSupplier(editingSupplier.id, payload);
      if (res.success && res.data) {
        setSuppliers((prev) =>
          prev.map((s) => (s.id === editingSupplier.id ? res.data! : s))
        );
        setIsCreateOpen(false);
        setEditingSupplier(null);
      } else {
        setErrorMsg(res.error || "Failed to update supplier");
      }
    } else {
      const res = await createSupplier(payload);
      if (res.success && res.data) {
        setSuppliers((prev) => [res.data!, ...prev]);
        setIsCreateOpen(false);
      } else {
        setErrorMsg(res.error || "Failed to create supplier");
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    setActionMenuOpenId(null);
    const res = await deleteSupplier(id);
    if (res.success) {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      alert(res.error || "Failed to delete supplier");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Code",
      "Name",
      "Phone",
      "Email",
      "Tax Number",
      "Total Purchase Due",
      "Total Purchase Return Due",
    ];
    const rows = filteredSuppliers.map((s) => [
      s.code,
      `"${s.name}"`,
      s.phone || "",
      s.email || "",
      s.tax_number || "",
      s.total_purchase_due,
      s.total_purchase_return_due,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "suppliers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)]">
      {/* Top Title & Breadcrumbs Bar */}
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
            Supplier Management
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="hover:text-gray-700 cursor-pointer">Suppliers</span>
            <span>|</span>
            <span className="text-gray-400">Supplier Management</span>
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
        {/* Search input */}
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

          <button className="px-3.5 py-1.5 bg-[#2563eb] text-white hover:bg-blue-700 rounded-md text-xs font-medium flex items-center gap-1.5 transition shadow-xs">
            <Download size={14} />
            <span>Import Suppliers</span>
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

      {/* Main Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-white text-xs font-semibold text-gray-800">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === paginatedSuppliers.length &&
                      paginatedSuppliers.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort("code")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Code</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("phone")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Phone</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("tax_number")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Tax Number</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_purchase_due")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Purchase Due</span>
                    <ChevronsUpDown size={14} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_purchase_return_due")}
                  className="py-3 px-3 cursor-pointer select-none hover:text-purple-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Purchase Return Due</span>
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                paginatedSuppliers.map((sup) => {
                  const isSelected = selectedIds.has(sup.id);
                  return (
                    <tr
                      key={sup.id}
                      className={`border-b border-gray-100 transition-colors text-xs sm:text-sm font-normal
                        ${
                          isSelected
                            ? "bg-[#eef2f6]"
                            : "hover:bg-gray-50/80 bg-white"
                        }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(sup.id)}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-800">
                        {sup.code}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-800">
                        {sup.name}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {sup.phone || ""}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {sup.email || ""}
                      </td>
                      <td className="py-3.5 px-3 text-gray-600">
                        {sup.tax_number || ""}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-700">
                        {typeof sup.total_purchase_due === "number"
                          ? sup.total_purchase_due.toFixed(2)
                          : Number(sup.total_purchase_due || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-gray-700">
                        {typeof sup.total_purchase_return_due === "number"
                          ? sup.total_purchase_return_due.toFixed(2)
                          : Number(sup.total_purchase_return_due || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(
                              actionMenuOpenId === sup.id ? null : sup.id
                            );
                          }}
                          className="p-1 rounded text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {actionMenuOpenId === sup.id && (
                          <div className="absolute right-6 top-8 w-36 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 z-50 text-left">
                            <button
                              onClick={() => {
                                handleOpenEdit(sup);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(sup.id)}
                              className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
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
              {filteredSuppliers.length === 0
                ? "0 - 0 of 0"
                : `${startIndex + 1} - ${Math.min(
                    startIndex + rowsPerPage,
                    filteredSuppliers.length
                  )} of ${filteredSuppliers.length}`}
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

      {/* Modal Dialog for Create / Edit Supplier */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-base text-gray-900">
                {editingSupplier ? "Edit Supplier" : "Create New Supplier"}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
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
                    Supplier Code
                  </label>
                  <input
                    type="number"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="101"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Electro Supplier Ltd"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="01711223344"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="supplier@electro.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Tax Number
                </label>
                <input
                  type="text"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="TX-4921"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Total Purchase Due
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_purchase_due}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_purchase_due: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Total Purchase Return Due
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_purchase_return_due}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_purchase_return_due: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
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
                    : editingSupplier
                    ? "Update Supplier"
                    : "Create Supplier"}
                </button>
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

