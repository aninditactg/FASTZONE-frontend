// actions.ts
"use server";

import { revalidatePath } from "next/cache";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  Supplier,
  CreateSupplierInput,
  UpdateSupplierInput,
  ActionResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500/api";

/**
 * Shared helper for making requests to the Express backend
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ActionResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: options.method && options.method !== "GET" ? "no-store" : "no-store",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        result?.message ||
        result?.error ||
        `Request failed with status ${response.status}`;
      return { success: false, error: errorMessage };
    }

    // Supports backends that return either `{ data: ... }` or the raw payload directly
    const data = result?.data !== undefined ? result.data : result;
    return { success: true, data: data as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error occurred",
    };
  }
}

// ============================================================================
// USERS ACTIONS (/people/users)
// ============================================================================

export async function getUsers(): Promise<ActionResponse<User[]>> {
  return apiRequest<User[]>("/users");
}

export async function getUserById(id: number | string): Promise<ActionResponse<User>> {
  return apiRequest<User>(`/users/${id}`);
}

export async function createUser(
  payload: CreateUserInput
): Promise<ActionResponse<User>> {
  const res = await apiRequest<User>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/users");
  }
  return res;
}

export async function updateUser(
  id: number | string,
  payload: UpdateUserInput
): Promise<ActionResponse<User>> {
  const res = await apiRequest<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/users");
  }
  return res;
}

export async function deleteUser(
  id: number | string
): Promise<ActionResponse<{ id: number | string }>> {
  const res = await apiRequest<{ id: number | string }>(`/users/${id}`, {
    method: "DELETE",
  });

  if (res.success) {
    revalidatePath("/people/users");
  }
  return res;
}

// ============================================================================
// CUSTOMERS ACTIONS (/people/customers)
// ============================================================================

export async function getCustomers(): Promise<ActionResponse<Customer[]>> {
  return apiRequest<Customer[]>("/customers");
}

export async function getCustomerById(
  id: number | string
): Promise<ActionResponse<Customer>> {
  return apiRequest<Customer>(`/customers/${id}`);
}

export async function createCustomer(
  payload: CreateCustomerInput
): Promise<ActionResponse<Customer>> {
  const res = await apiRequest<Customer>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/customers");
  }
  return res;
}

export async function updateCustomer(
  id: number | string,
  payload: UpdateCustomerInput
): Promise<ActionResponse<Customer>> {
  const res = await apiRequest<Customer>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/customers");
  }
  return res;
}

export async function deleteCustomer(
  id: number | string
): Promise<ActionResponse<{ id: number | string }>> {
  const res = await apiRequest<{ id: number | string }>(`/customers/${id}`, {
    method: "DELETE",
  });

  if (res.success) {
    revalidatePath("/people/customers");
  }
  return res;
}

// ============================================================================
// SUPPLIERS ACTIONS (/people/suppliers)
// ============================================================================

export async function getSuppliers(): Promise<ActionResponse<Supplier[]>> {
  return apiRequest<Supplier[]>("/suppliers");
}

export async function getSupplierById(
  id: number | string
): Promise<ActionResponse<Supplier>> {
  return apiRequest<Supplier>(`/suppliers/${id}`);
}

export async function createSupplier(
  payload: CreateSupplierInput
): Promise<ActionResponse<Supplier>> {
  const res = await apiRequest<Supplier>("/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/suppliers");
  }
  return res;
}

export async function updateSupplier(
  id: number | string,
  payload: UpdateSupplierInput
): Promise<ActionResponse<Supplier>> {
  const res = await apiRequest<Supplier>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (res.success) {
    revalidatePath("/people/suppliers");
  }
  return res;
}

export async function deleteSupplier(
  id: number | string
): Promise<ActionResponse<{ id: number | string }>> {
  const res = await apiRequest<{ id: number | string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });

  if (res.success) {
    revalidatePath("/people/suppliers");
  }
  return res;
}