import { getCustomers } from "@/lib/actions";
import CustomersClient from "@/components/customers/CustomersClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  // Fetch customers from backend via server API
  const res = await getCustomers();
  const customers = res.success && res.data ? res.data : [];

  return <CustomersClient initialCustomers={customers} />;
}