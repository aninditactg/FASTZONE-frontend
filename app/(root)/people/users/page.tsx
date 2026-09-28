import { getUsers } from "@/lib/actions";
import UsersClient from "@/components/users/UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  // Fetch users from backend via server API
  const res = await getUsers();
  const users = res.success && res.data ? res.data : [];

  return <UsersClient initialUsers={users} />;
}