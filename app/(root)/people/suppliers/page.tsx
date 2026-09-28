import { getSuppliers } from "@/lib/actions";
import SuppliersClient from "@/components/suppliers/SuppliersClient";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  // Fetch suppliers from backend via server API
  const res = await getSuppliers();
  const suppliers = res.success && res.data ? res.data : [];

  return <SuppliersClient initialSuppliers={suppliers} />;
}